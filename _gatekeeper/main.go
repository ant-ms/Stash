package main

import (
	"database/sql"
	"encoding/binary"
	"encoding/json"
	"io"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/gorilla/websocket"
	_ "github.com/jackc/pgx/v4/stdlib" // PostgreSQL driver
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // In production, you may want stricter origin checks.
}

// ClientMessage defines the structure for messages from the WebSocket client.
type ClientMessage struct {
	Opcode int             `json:"opcode"`
	Body   json.RawMessage `json:"body"`
}

func main() {
	// Load environment variables
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL environment variable is not set")
	}

	proxyTargetURL := os.Getenv("PROXY_TARGET_URL")
	if proxyTargetURL == "" {
		log.Fatal("PROXY_TARGET_URL environment variable is not set")
	}

	// Database connection setup
	db, err := sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// Middleware to check session header for each request
	authMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/signin" || r.URL.Path == "/manifest.json" || r.URL.Path == "/worker.js" || startsWith(r.URL.Path, "/signin") || startsWith(r.URL.Path, "/_app") || startsWith(r.URL.Path, "/icons/") {
				next.ServeHTTP(w, r)
				return
			}

			sessionToken := r.URL.Query().Get("session") // Check for token in URL parameters
			if sessionToken == "" {
				cookie, err := r.Cookie("session") // Check for token in cookies
				if err != nil {
					http.Redirect(w, r, "/signin", http.StatusTemporaryRedirect)
					return
				}
				sessionToken = cookie.Value // Use the Value field of the cookie
			}

			if !isValidSession(db, sessionToken) {
				http.Redirect(w, r, "/signin", http.StatusFound)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	fs := http.FileServer(http.Dir("./media"))
	http.Handle("/file/", authMiddleware(http.StripPrefix("/file", fs)))

	fs_seek := http.FileServer(http.Dir("./thumbnails"))
	http.Handle("/thumb/", authMiddleware(http.StripPrefix("/thumb", fs_seek)))

	// WebSocket to TCP proxy handler
	http.HandleFunc("/tcp/", func(w http.ResponseWriter, r *http.Request) {
		// Extract target IP and port from the URL path
		pathParts := strings.Split(r.URL.Path, "/")
		if len(pathParts) < 4 {
			http.Error(w, "Invalid WebSocket target format. Must be /tcp/<ip>/<port>", http.StatusBadRequest)
			return
		}

		targetIP := pathParts[2]
		targetPort := pathParts[3]

		targetAddr := targetIP + ":" + targetPort
		proxyWsToTcp(w, r, targetAddr)
	})

	// Set up the reverse proxy for all other requests
	targetURL, err := url.Parse(proxyTargetURL)
	if err != nil {
		log.Fatalf("Failed to parse target URL: %v", err)
	}

	proxy := httputil.NewSingleHostReverseProxy(targetURL)
	http.Handle("/", authMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Proxy request to the target server
		proxy.ServeHTTP(w, r)
	})))

	// Start the server on port 8080
	port := ":80"
	log.Printf("Server is listening on port %s...", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// proxyWsToTcp handles the proxying between a WebSocket client and a backend TCP server.
func proxyWsToTcp(w http.ResponseWriter, r *http.Request, targetAddr string) {
	// Upgrade the client connection to WebSocket
	wsConn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer wsConn.Close()
	log.Println("Frontend websocket connected")

	// Connect to the target TCP server
	tcpConn, err := net.Dial("tcp", targetAddr)
	if err != nil {
		log.Printf("Failed to connect to target TCP server %s: %v", targetAddr, err)
		return
	}
	defer tcpConn.Close()
	log.Println("Connected to fcast TCP server")

	errChan := make(chan error, 2)

	// Goroutine to handle messages from client (WebSocket) to target (TCP)
	go func() {
		for {
			_, message, err := wsConn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("wsConn.ReadMessage error: %v", err)
				}
				errChan <- err
				return
			}

			var msg ClientMessage
			if err := json.Unmarshal(message, &msg); err != nil {
				log.Printf("Error unmarshalling message from frontend: %v", err)
				continue
			}

			body := msg.Body
			if body == nil || string(body) == "null" {
				body = []byte{}
			}

			header := make([]byte, 5)
			binary.LittleEndian.PutUint32(header[0:4], uint32(len(body)+1))
			header[4] = byte(msg.Opcode)

			packet := append(header, body...)

			if _, err := tcpConn.Write(packet); err != nil {
				log.Printf("tcpConn.Write error: %v", err)
				errChan <- err
				return
			}
		}
	}()

	// Goroutine to handle messages from target (TCP) to client (WebSocket)
	go func() {
		for {
			header := make([]byte, 5)
			if _, err := io.ReadFull(tcpConn, header); err != nil {
				if err != io.EOF {
					log.Printf("tcpConn.Read header error: %v", err)
				}
				errChan <- err
				return
			}

			size := binary.LittleEndian.Uint32(header[0:4])
			opcode := header[4]
			bodySize := size - 1

			var body json.RawMessage
			if bodySize > 0 {
				bodyBytes := make([]byte, bodySize)
				if _, err := io.ReadFull(tcpConn, bodyBytes); err != nil {
					log.Printf("tcpConn.Read body error: %v", err)
					errChan <- err
					return
				}
				body = json.RawMessage(bodyBytes)
			}

			response := ClientMessage{Opcode: int(opcode), Body: body}
			responseJSON, err := json.Marshal(response)
			if err != nil {
				log.Printf("Error marshalling response to frontend: %v", err)
				continue
			}

			if err := wsConn.WriteMessage(websocket.TextMessage, responseJSON); err != nil {
				log.Printf("wsConn.WriteMessage error: %v", err)
				errChan <- err
				return
			}
		}
	}()

	err = <-errChan
	log.Printf("Proxy error: %v. Closing connections.", err)
}

// isValidSession checks if the session token is valid by querying the database
func isValidSession(db *sql.DB, token string) bool {
	var exists bool
	// log.Printf("Checking session token: %s", token)
	query := `SELECT EXISTS (SELECT 1 FROM "Session" WHERE token = $1)`
	err := db.QueryRow(query, token).Scan(&exists)
	if err != nil {
		log.Printf("Database query error: %v", err)
		return false
	}
	return exists
}

// startsWith checks if the URL path starts with the specified prefix
func startsWith(path, prefix string) bool {
	return len(path) >= len(prefix) && path[:len(prefix)] == prefix
}

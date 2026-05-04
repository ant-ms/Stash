const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function getConfigPath() {
  return path.join(app.getPath("userData"), "config.json");
}

function getStoredUrl() {
  try {
    const data = fs.readFileSync(getConfigPath(), "utf8");
    return JSON.parse(data).serverUrl;
  } catch (e) {
    return null;
  }
}

function setStoredUrl(url) {
  try {
    fs.writeFileSync(getConfigPath(), JSON.stringify({ serverUrl: url }));
  } catch (e) {
    console.error("Failed to save config", e);
  }
}

function showConfigScreen(errorMessage = "") {
  mainWindow.loadFile(path.join(__dirname, "config.html")).then(() => {
    if (errorMessage) {
      setTimeout(() => {
        mainWindow.webContents.send("load-error", errorMessage);
      }, 100);
    }
  });
}

function loadTargetUrl(url) {
  mainWindow.loadURL(url).catch((err) => {
    console.error("Failed to load URL:", err);
    showConfigScreen(`Failed to connect to ${url}`);
  });
}

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 810,
    titleBarStyle: "hidden",
    titleBarOverlay: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const storedUrl = getStoredUrl();
  const targetUrl =
    process.env.SERVER_URL ||
    storedUrl ||
    (isDev ? "http://localhost:5173" : "");

  if (targetUrl) {
    loadTargetUrl(targetUrl);
  } else {
    showConfigScreen();
  }

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (isMainFrame && !validatedURL.includes("config.html")) {
        showConfigScreen(`Failed to load ${validatedURL}: ${errorDescription}`);
      }
    },
  );

  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.executeJavaScript(
      "window.fullscreenChanged && window.fullscreenChanged(true)",
    );
  });

  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.executeJavaScript(
      "window.fullscreenChanged && window.fullscreenChanged(false)",
    );
  });
});

ipcMain.on("save-url", (event, url) => {
  let formattedUrl = url;
  if (
    !formattedUrl.startsWith("http://") &&
    !formattedUrl.startsWith("https://")
  ) {
    formattedUrl = "http://" + formattedUrl;
  }
  setStoredUrl(formattedUrl);
  loadTargetUrl(formattedUrl);
});

app.on("window-all-closed", app.quit);

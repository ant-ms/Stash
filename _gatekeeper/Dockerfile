FROM golang:1.26.3 as builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/gatekeeper


FROM scratch
COPY --from=builder /app/gatekeeper /app/gatekeeper
EXPOSE 80
CMD ["/app/gatekeeper"]

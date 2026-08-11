# Build stage
FROM golang:1.25.4-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code. Context is backend/ — the SPA is NOT built here, it comes from
# the committed internal/dist and is embedded by //go:embed all:dist.
COPY . .

# Build migration binary
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/migration cmd/migration/main.go

# Build server binary
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/imagine_backend cmd/server/main.go

# Final stage
FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binaries from builder
COPY --from=builder /app/bin/migration ./bin/
COPY --from=builder /app/bin/imagine_backend ./bin/
COPY --from=builder /app/start.sh ./

# Guard against CRLF from Windows checkouts + make executable
RUN tr -d '\r' < start.sh > start.sh.tmp && mv start.sh.tmp start.sh && chmod +x ./start.sh

# Export port
EXPOSE 8080

# Command to run
CMD ["./start.sh"]

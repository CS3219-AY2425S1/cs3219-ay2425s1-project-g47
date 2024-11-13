# Stage 1: Build the Go binary
FROM golang:1.19 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy Go module files and install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the application source code
COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o voice-service main.go

# Stage 2: Create a smaller image to run the binary
FROM alpine:latest

# Install CA certificates for HTTPS support
RUN apk --no-cache add ca-certificates

# Set working directory and copy the compiled binary from the builder stage
WORKDIR /root/
COPY --from=builder /app/voice-service .

# Expose the application port (update this if your Go app uses a different port)
EXPOSE 8085

# Run the application
CMD ["./voice-service"]
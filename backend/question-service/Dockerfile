# Build the Go application
FROM golang:1.18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire project
COPY . .

# Build the Go service
RUN go build -o /my-go-service ./cmd

# Create the final image
FROM alpine:latest

# Set the working directory
WORKDIR /root/

# Copy the built Go binary from the builder stage
COPY --from=builder /my-go-service .

# Copy the .env file from the backend folder
COPY --from=builder /app/.env .

# Expose the port your application runs on
EXPOSE 5050

# Command to run the Go service
CMD ["./my-go-service"]

package main

import (
    "log"
    "sync"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
	"voice-service/controller"
)

type Room struct {
    Peer1ID string
    Peer2ID string
}

var (
    rooms      = make(map[string]*Room)
    roomsMutex = sync.Mutex{}
)

func main() {
    router := gin.Default()

    // Add CORS middleware to allow requests from localhost:3000
    router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    // Endpoint to join a room
    router.GET("/join/:roomID", controller.JoinRoom)

    log.Println("Starting server on port 8085")
    if err := router.Run(":8085"); err != nil {
        log.Fatalf("Server failed to start: %v", err)
    }
}

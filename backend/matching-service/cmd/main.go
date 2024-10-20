package main

import (
	"log"
	"matching-service/internal/controllers"
	"matching-service/internal/services"
	"matching-service/internal/socket"
	"matching-service/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to MongoDB
	services.ConnectToMongo()

	// Connect to RabbitMQ
	err := services.ConnectToRabbitMQ()
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer services.CloseRabbitMQ()

	// Run the WebSocket message handler in the background
	go socket.HandleMessages()

	// Set up Gin router
	router := gin.Default()
	// Configure CORS middleware
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}

	// Apply the CORS middleware to the router
	router.Use(cors.New(config))
	// WebSocket route to handle connections
	router.GET("/ws", socket.HandleConnections)

	// Apply authentication middleware to all routes that need protection
	authRoutes := router.Group("/")
	authRoutes.Use(middleware.VerifyAccessToken) // Apply authentication to all routes within this group
	{
		// Route for adding users (requires authentication)
		authRoutes.POST("/addUser", controllers.AddUserHandler)

		// Route for cancelling a user (requires authentication)
		authRoutes.POST("/cancel/:userID", controllers.CancelMatchHandler)
	}


	// Start the server
	log.Println("Server started on :3002")
	router.Run(":3002")
}

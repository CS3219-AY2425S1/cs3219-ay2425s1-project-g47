package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"backend/internal/controllers"
	"backend/internal/routes"

	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var questionCollection *mongo.Collection

func main() {
	log.Println("Starting the Go application...")

	// Load environment variables from the .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	// Get the MongoDB URI from the environment variable
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI not set in .env file")
	}

	// Set up MongoDB client options
	clientOptions := options.Client().ApplyURI(mongoURI)

	// Connect to MongoDB
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal("Error connecting to MongoDB:", err)
	}

	// Ping MongoDB to ensure the connection is established
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Error pinging MongoDB:", err)
	}

	// Initialize the MongoDB collection (questions)
	questionCollection = client.Database("questiondb").Collection("questions")
	if questionCollection == nil {
		log.Fatal("Failed to initialize questionCollection")
	}
	log.Println("questionCollection initialized successfully")

	// Set the collection in the controller
	controllers.SetCollection(questionCollection)

	// Initialize the router
	r := mux.NewRouter()

	// Enable CORS
	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	origins := handlers.AllowedOrigins([]string{"*"}) // Allow all origins or specify your frontend's origin

	// Register the routes for the API
	routes.RegisterQuestionRoutes(r)

	// Start the HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "5050"
	}
	log.Println("Starting the server on port", port)
	log.Fatal(http.ListenAndServe(":5050", handlers.CORS(headers, methods, origins)(r)))
}

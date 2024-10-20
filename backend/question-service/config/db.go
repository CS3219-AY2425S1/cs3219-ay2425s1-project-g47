package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// DB holds the MongoDB client instance
var DB *mongo.Client = ConnectDB()

// ConnectDB connects to MongoDB and returns the client
func ConnectDB() *mongo.Client {
	mongoURI := os.Getenv("MONGO_URI")

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.NewClient(clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB!")
	return client
}

// GetCollection returns a MongoDB collection
func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	return client.Database("questiondb").Collection(collectionName)
}

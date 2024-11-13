package services

import (
	"encoding/json"
	"fmt"
	"log"
	"matching-service/internal/models"
	"os"

	"github.com/joho/godotenv"
	"github.com/streadway/amqp"
)

var RabbitMQConn *amqp.Connection
var RabbitMQChannel *amqp.Channel

// ConnectToRabbitMQ initializes RabbitMQ connection and channel
func ConnectToRabbitMQ() error {
	// Load environment variables
	err := godotenv.Load(".env")
	if err != nil {
		return fmt.Errorf("error loading .env file: %v", err)
	}

	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		return fmt.Errorf("RABBITMQ_URL not set in environment")
	}

	// Establish connection to RabbitMQ
	RabbitMQConn, err = amqp.Dial(rabbitMQURL)
	if err != nil {
		return fmt.Errorf("failed to connect to RabbitMQ: %v", err)
	}

	// Open a channel
	RabbitMQChannel, err = RabbitMQConn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open a RabbitMQ channel: %v", err)
	}

	log.Println("Connected to RabbitMQ")
	return nil
}

// PublishMatch publishes a match result to RabbitMQ
func PublishMatch(matchResult models.MatchResult) error {
	if RabbitMQChannel == nil {
		return fmt.Errorf("RabbitMQ channel is not initialized")
	}

	// Serialize the matchResult to JSON
	body, err := json.Marshal(matchResult)
	if err != nil {
		return fmt.Errorf("failed to marshal match result: %v", err)
	}

	// Publish the message to RabbitMQ
	err = RabbitMQChannel.Publish(
		"",            // exchange
		"match_queue", // routing key (queue name)
		false,         // mandatory
		false,         // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish match result: %v", err)
	}

	log.Printf("Published match result to RabbitMQ: %+v", matchResult)
	return nil
}

// CloseRabbitMQ closes the RabbitMQ connection and channel
func CloseRabbitMQ() {
	if RabbitMQChannel != nil {
		RabbitMQChannel.Close()
	}
	if RabbitMQConn != nil {
		RabbitMQConn.Close()
	}
	log.Println("RabbitMQ connection closed")
}

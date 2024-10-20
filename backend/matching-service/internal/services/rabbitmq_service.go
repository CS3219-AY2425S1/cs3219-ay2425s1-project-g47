package services

import (
	"encoding/json"
	"fmt"
	"log"
	"matching-service/internal/models"
	"os"

	"github.com/gorilla/websocket"
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

func notifyUsersOfMatch(matchResult models.MatchResult) {
	// Send a message to User 1
	if conn, ok := clients[matchResult.UserOneSocketID]; ok {
		err := conn.WriteJSON(map[string]string{
			"message":      "You have been matched!",
			"matched_user": matchResult.UserTwoSocketID,
			"room_id":      matchResult.RoomID,
		})
		if err != nil {
			log.Printf("Error sending WebSocket message to user %s: %v", matchResult.UserOneSocketID, err)
		}
	} else {
		log.Printf("No active WebSocket connection for user %s", matchResult.UserOneSocketID)
	}

	// Send a message to User 2
	if conn, ok := clients[matchResult.UserTwoSocketID]; ok {
		err := conn.WriteJSON(map[string]string{
			"message":      "You have been matched!",
			"matched_user": matchResult.UserOneSocketID,
			"room_id":      matchResult.RoomID,
		})
		if err != nil {
			log.Printf("Error sending WebSocket message to user %s: %v", matchResult.UserTwoSocketID, err)
		}
	} else {
		log.Printf("No active WebSocket connection for user %s", matchResult.UserOneSocketID)
	}
}

var clients = make(map[string]*websocket.Conn) // Connected clients mapped by socket_id

// StartRabbitMQConsumer listens for messages from the "match_queue" RabbitMQ queue
func StartRabbitMQConsumer() {
	// Make sure RabbitMQ connection and channel are set up
	if RabbitMQChannel == nil {
		log.Fatalf("RabbitMQ Channel is not initialized")
		return
	}

	// Declare the queue
	queue, err := RabbitMQChannel.QueueDeclare(
		"match_queue", // queue name
		true,          // durable
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare RabbitMQ queue: %v", err)
	}

	// Start consuming messages from the queue
	msgs, err := RabbitMQChannel.Consume(
		queue.Name, // queue
		"",         // consumer
		true,       // auto-ack
		false,      // exclusive
		false,      // no-local
		false,      // no-wait
		nil,        // args
	)
	if err != nil {
		log.Fatalf("Failed to start consuming RabbitMQ messages: %v", err)
	}

	// Listen for incoming messages and handle them
	go func() {
		for d := range msgs {
			var matchResult models.MatchResult
			err := json.Unmarshal(d.Body, &matchResult)
			if err != nil {
				log.Printf("Error unmarshalling message: %v", err)
				continue
			}

			log.Printf("Consumed match result: %v", matchResult)

			// Notify both users of the match via WebSocket
			notifyUsersOfMatch(matchResult)
		}
	}()
}

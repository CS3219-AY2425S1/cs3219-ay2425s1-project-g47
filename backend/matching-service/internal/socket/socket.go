package socket

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var clients = make(map[string]*websocket.Conn) // Map to hold WebSocket clients by their socket_id
var broadcast = make(chan MatchMessage)        // Channel for broadcasting messages

// MatchMessage represents the message to be sent to the frontend
type MatchMessage struct {
	User1 string `json:"user1"`
	User2 string `json:"user2"`
	State string `json:"state"`
}

// WebSocket upgrader (to upgrade HTTP connections to WebSockets)
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow connections from any origin
	},
}

// HandleConnections manages incoming WebSocket requests and upgrades them to WebSocket connections
func HandleConnections(c *gin.Context) {
	// Extract socket_id from the query parameters
	socketID := c.Query("socket_id")
	if socketID == "" {
		log.Println("No socket_id provided")
		c.JSON(http.StatusBadRequest, gin.H{"error": "socket_id is required"})
		return
	}

	// Upgrade the HTTP connection to a WebSocket connection
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Failed to upgrade WebSocket connection:", err)
		return
	}
	defer ws.Close()

	// Register the client by socket_id
	clients[socketID] = ws
	log.Printf("New WebSocket connection established for socket_id: %s", socketID)

	// Listen for messages from the client (in this case, we just wait for the client to disconnect)
	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			log.Printf("WebSocket connection closed for socket_id: %s", socketID)
			delete(clients, socketID)
			break
		}
	}
}

// BroadcastMatch sends a match result to all connected WebSocket clients
func BroadcastMatch(msg MatchMessage) {
	broadcast <- msg
}

// HandleMessages listens for new messages and broadcasts them to all clients
func HandleMessages() {
	for {
		// Get the next message from the broadcast channel
		msg := <-broadcast

		// Send the message to the two matched clients
		if conn, ok := clients[msg.User1]; ok {
			err := conn.WriteJSON(msg)
			if err != nil {
				log.Printf("Error sending WebSocket message to user %s: %v", msg.User1, err)
				conn.Close()
				delete(clients, msg.User1)
			}
		}
		if conn, ok := clients[msg.User2]; ok {
			err := conn.WriteJSON(msg)
			if err != nil {
				log.Printf("Error sending WebSocket message to user %s: %v", msg.User2, err)
				conn.Close()
				delete(clients, msg.User2)
			}
		}
	}
}

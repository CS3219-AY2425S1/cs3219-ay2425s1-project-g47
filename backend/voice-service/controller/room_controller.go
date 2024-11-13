package controller

import (
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Room represents a voice chat room with two peers
type Room struct {
	Peer1ID string
	Peer2ID string
}

var (
	rooms      = make(map[string]*Room)
	roomsMutex = sync.Mutex{}
)

// JoinRoom handles requests to join or reconnect to a room.
func JoinRoom(c *gin.Context) {
	roomID := c.Param("roomID")
	providedPeerID := c.Query("peerID") // Get the peerID from the query parameter for reconnection
	log.Printf("Attempting to join RoomID: %s with Provided PeerID: %s", roomID, providedPeerID)

	roomsMutex.Lock()
	defer roomsMutex.Unlock()

	// Ensure room entry exists in the map
	if rooms[roomID] == nil {
		rooms[roomID] = &Room{}
		log.Printf("Created new room for RoomID: %s", roomID)
	}
	room := rooms[roomID]

	// Reconnection logic: Check if providedPeerID matches an existing peer in the room
	if providedPeerID != "" {
		if providedPeerID == room.Peer1ID || providedPeerID == room.Peer2ID {
			log.Printf("Reconnecting with existing PeerID: %s", providedPeerID)
			c.JSON(http.StatusOK, gin.H{
				"peerID":           providedPeerID,
				"connectionPeerID": getConnectionPeerID(room, providedPeerID),
			})
			return
		} else {
			log.Printf("Provided PeerID: %s does not match any existing PeerID in RoomID: %s", providedPeerID, roomID)
		}
	}

	// If it's a new join (no valid providedPeerID for reconnection), generate a new peerID
	newPeerID := generatePeerID()
	if room.Peer1ID == "" {
		room.Peer1ID = newPeerID
		log.Printf("Assigned new Peer1ID: %s for RoomID: %s", room.Peer1ID, roomID)
		c.JSON(http.StatusOK, gin.H{
			"peerID":           room.Peer1ID,
			"connectionPeerID": room.Peer2ID,
		})
		return
	} else if room.Peer2ID == "" {
		room.Peer2ID = newPeerID
		log.Printf("Assigned new Peer2ID: %s for RoomID: %s", room.Peer2ID, roomID)
		c.JSON(http.StatusOK, gin.H{
			"peerID":           room.Peer2ID,
			"connectionPeerID": room.Peer1ID,
		})
		return
	}

	// Room is full, and reconnection failed
	log.Printf("Room %s is full and reconnection failed. Provided PeerID: %s", roomID, providedPeerID)
	c.JSON(http.StatusBadRequest, gin.H{"error": "Room is full and no reconnection match found"})
}

// getConnectionPeerID returns the connection peer ID for the other peer in the room.
func getConnectionPeerID(room *Room, peerID string) string {
	if room.Peer1ID == peerID {
		return room.Peer2ID
	} else if room.Peer2ID == peerID {
		return room.Peer1ID
	}
	return ""
}

// generatePeerID creates a random unique peer ID with a prefix
func generatePeerID() string {
	rand.Seed(time.Now().UnixNano())
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	length := 10
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return "peer-" + string(result)
}

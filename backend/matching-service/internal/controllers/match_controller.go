package controllers

import (
	"log"
	"matching-service/internal/models"
	"matching-service/internal/services"
	"matching-service/internal/socket"
	"matching-service/internal/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AddUserHandler handles the request to add a user and start matching
func AddUserHandler(c *gin.Context) {
	var matchingInfo models.MatchingInfo
	if err := c.ShouldBindJSON(&matchingInfo); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	matchingInfo.Status = models.Pending
	matchingInfo.RoomID = uuid.New().String()

	// Insert matching info into MongoDB
	_, err := services.InsertMatching(matchingInfo)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	go startMatchingProcess(matchingInfo)

	c.JSON(200, gin.H{"message": "User added", "user_id": matchingInfo.UserID})
}

// CancelMatchHandler handles the request to cancel a user's match search
func CancelMatchHandler(c *gin.Context) {
	userID := c.Param("userID")

	// Update the user's status to 'Cancelled' in MongoDB
	err := services.CancelUserMatch(userID)
	if err != nil {
		log.Printf("Error canceling match for user_id: %s, error: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel match"})
		return
	}

	log.Printf("User %s has successfully canceled their match", userID)
	c.JSON(http.StatusOK, gin.H{"message": "Match search canceled"})
}

// matchProgrammingLanguages checks if users share at least one common programming language or if they want to generalize the language matching
func matchProgrammingLanguages(user1Languages, user2Languages []models.ProgrammingLanguageEnum, generalize bool) bool {
	if generalize {
		return true // Skip language check if generalization is allowed
	}

	for _, lang1 := range user1Languages {
		for _, lang2 := range user2Languages {
			if lang1 == lang2 {
				return true // Match found with a common language
			}
		}
	}
	return false // No common language
}

// startMatchingProcess starts the matching logic with a timeout
func startMatchingProcess(matchingInfo models.MatchingInfo) {
	matchChan := make(chan *models.MatchingInfo)

	// Start a goroutine to attempt matching the user
	go func() {
		result, err := services.FindMatch(matchingInfo)
		if err != nil || result == nil {
			matchChan <- nil
			return
		}

		// Only check programming languages if generalize_languages is false
		if !matchingInfo.GeneralizeLanguages {
			// Check if programming languages match
			if !matchProgrammingLanguages(matchingInfo.ProgrammingLanguages, result.ProgrammingLanguages, matchingInfo.GeneralizeLanguages) {
				// If programming languages do not match and generalization is not allowed, discard the match
				log.Printf("No match for user_id: %s due to language mismatch", matchingInfo.UserID)
				matchChan <- nil
				return
			}
		}

		// If generalization is allowed or languages match, proceed with the match
		matchChan <- result

	}()

	// Set up a 30-second timeout
	select {
	case matchedUser := <-matchChan:
		if matchedUser != nil {
			// A match was found, proceed with the match
			log.Printf("Found a match for user_id: %s", matchingInfo.UserID)

			// Check if both users are still Pending before proceeding
			user1Status, err := services.GetUserStatus(matchingInfo.UserID)
			if err != nil {
				log.Printf("Error retrieving status for user_id: %s", matchingInfo.UserID)
				return
			}

			user2Status, err := services.GetUserStatus(matchedUser.UserID)
			if err != nil {
				log.Printf("Error retrieving status for user_id: %s", matchedUser.UserID)
				return
			}

			if user1Status == models.Cancelled || user2Status == models.Cancelled {
				log.Printf("User %s or %s has cancelled, match discarded", matchingInfo.UserID, matchedUser.UserID)
				return
			}

			// Cancel the timeout for both users
			if timer, ok := utils.Store[matchingInfo.UserID]; ok {
				timer.Stop() // Stop the timer for user 1
				delete(utils.Store, matchingInfo.UserID)
			}

			if timer, ok := utils.Store[matchedUser.UserID]; ok {
				timer.Stop() // Stop the timer for user 2
				delete(utils.Store, matchedUser.UserID)
			}

			// Use the room_id of the first user (initiator) and set it for both users
			roomID := matchingInfo.RoomID

			// Update the status and room_id of both users in MongoDB (only after the match is confirmed)
			err = services.UpdateMatchStatusAndRoomID(matchingInfo.UserID, "Matched", roomID)
			if err != nil {
				log.Printf("Error updating status for user_id: %s", matchingInfo.UserID)
			}

			err = services.UpdateMatchStatusAndRoomID(matchedUser.UserID, "Matched", roomID)
			if err != nil {
				log.Printf("Error updating status for user_id: %s", matchedUser.UserID)
			}

			// Prepare the match result
			matchResult := models.MatchResult{
				UserOneSocketID: matchingInfo.SocketID,
				UserTwoSocketID: matchedUser.SocketID,
				RoomID:          roomID, // Use the roomID generated for this match
			}

			// Publish the match result to RabbitMQ
			err = services.PublishMatch(matchResult)
			if err != nil {
				log.Printf("Error publishing match result to RabbitMQ: %v", err)
			}

			// Send match result to WebSocket clients
			socket.BroadcastMatch(socket.MatchMessage{
				User1: matchingInfo.SocketID,
				User2: matchedUser.SocketID,
				State: "Matched",
			})

			log.Printf("User %s and User %s have been matched and published to RabbitMQ", matchingInfo.UserID, matchedUser.UserID)

		} else {
			// No match was found within the matchChan logic
			log.Printf("No match found for user_id: %s within matchChan logic", matchingInfo.UserID)

			time.Sleep(30 * time.Second) // Give the match process time to continue
			services.MarkAsTimeout(matchingInfo)
			log.Printf("User %s has been marked as Timeout", matchingInfo.UserID)
		}
	case <-time.After(30 * time.Second):
		// Timeout after 30 seconds, no match was found
		log.Printf("Timeout occurred for user_id: %s, no match found", matchingInfo.UserID)
		services.MarkAsTimeout(matchingInfo)
		log.Printf("User %s has been marked as Timeout (Timeout elapsed)", matchingInfo.UserID)
	}
}

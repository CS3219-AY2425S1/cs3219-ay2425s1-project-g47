package controllers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// UpdateQuestion updates a question in the MongoDB collection by UUID
func UpdateQuestion(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get the question ID from the URL parameters
	params := mux.Vars(r)
	questionID := params["id"]

	// Validate that the question ID is a valid UUID
	if _, err := uuid.Parse(questionID); err != nil {
		log.Println("Invalid UUID format:", err)
		http.Error(w, "Invalid question ID format", http.StatusBadRequest)
		return
	}

	// Prepare the update data
	var updateData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		log.Println("Error decoding update data:", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Check if the "title" field is being updated
	if title, ok := updateData["title"]; ok {
		// Convert the title to lowercase for the check
		lowercaseTitle := strings.ToLower(title.(string))

		// Query the database to check if a question with the same title already exists
		existingQuestion := bson.M{}
		filter := bson.M{
			"$expr": bson.M{
				"$and": []interface{}{
					bson.M{"$eq": []interface{}{bson.M{"$toLower": "$title"}, lowercaseTitle}}, // Check title case-insensitively
					bson.M{"$ne": []interface{}{"$questionid", questionID}},                    // Ensure it's not the same question being updated
				},
			},
		}

		err := questionCollection.FindOne(context.TODO(), filter).Decode(&existingQuestion)
		if err == nil {
			// If we find a document, the title is already in use
			log.Println("Duplicate title found")
			http.Error(w, "A question with this title already exists", http.StatusBadRequest)
			return
		} else if err != mongo.ErrNoDocuments {
			// If there is an error other than no documents found
			log.Println("Error checking for existing question:", err)
			http.Error(w, "Failed to check existing question", http.StatusInternalServerError)
			return
		}
	}

	// Ensure that the "UpdatedAt" field is updated with the current time
	updateData["updatedAt"] = time.Now()

	// Prepare the filter to find the question by UUID
	filter := bson.M{"questionid": questionID}

	// Create the update object using MongoDB's $set operator
	update := bson.M{
		"$set": updateData,
	}

	// Perform the update operation
	result, err := questionCollection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		log.Println("Error updating question:", err)
		http.Error(w, "Failed to update question", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Question not found", http.StatusNotFound)
		return
	}

	// Respond with success
	log.Println("Question updated successfully")
	json.NewEncoder(w).Encode("Question updated successfully")
}

package controllers

import (
	"context"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

// DeleteQuestion deletes a question from the MongoDB collection by ID
func DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get the question ID from the URL parameters
	params := mux.Vars(r)
	questionID := params["id"]

	// Validate the question ID to ensure it is a valid UUID
	_, err := uuid.Parse(questionID)
	if err != nil {
		log.Println("Invalid UUID format:", err)
		http.Error(w, "Invalid question ID format", http.StatusBadRequest)
		return
	}

	// Prepare the filter to find the question by UUID
	filter := bson.M{"questionid": questionID}

	// Delete the question from MongoDB
	result, err := questionCollection.DeleteOne(context.TODO(), filter)
	if err != nil {
		log.Println("Error deleting question:", err)
		http.Error(w, "Failed to delete question", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Question not found", http.StatusNotFound)
		return
	}

	log.Println("Question deleted successfully")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Question deleted successfully"))
}

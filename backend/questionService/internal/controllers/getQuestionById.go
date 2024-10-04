package controllers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"backend/internal/models"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetQuestionByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get the QuestionID from the URL parameters
	vars := mux.Vars(r)
	questionID := vars["id"]

	// Validate the question ID to ensure it is a valid UUID
	_, err := uuid.Parse(questionID)
	if err != nil {
		log.Println("Invalid UUID format:", err)
		http.Error(w, "Invalid question ID format", http.StatusBadRequest)
		return
	}

	log.Println("Received a request to fetch question by ID:", questionID)

	// Create a filter to search for the question by its QuestionID
	filter := bson.M{"questionid": questionID}

	// Find the question in the collection
	var question models.Question
	err = questionCollection.FindOne(context.TODO(), filter).Decode(&question)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// If the question is not found
			log.Println("Question not found with ID:", questionID)
			http.Error(w, "Question not found", http.StatusNotFound)
			return
		}

		// If there's an error in fetching the question
		log.Println("Error fetching question by ID:", err)
		http.Error(w, "Failed to fetch question", http.StatusInternalServerError)
		return
	}

	// Return the question as JSON
	log.Println("Returning question with ID:", questionID)
	json.NewEncoder(w).Encode(question)
	return
}

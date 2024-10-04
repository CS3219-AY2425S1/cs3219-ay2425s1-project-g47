package controllers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"backend/internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var questionCollection *mongo.Collection

// SetCollection sets the MongoDB collection in the controller
func SetCollection(collection *mongo.Collection) {
	questionCollection = collection
}

// CreateQuestion handles the POST request to create a new question
func CreateQuestion(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var question models.Question

	log.Println("Received a request to create a question...")

	// Decode the request body into the Question struct
	err := json.NewDecoder(r.Body).Decode(&question)
	if err != nil {
		log.Println("Error decoding request body:", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	log.Println("Decoded request body successfully...")

	// Convert the title to lowercase for the check
	lowercaseTitle := strings.ToLower(question.Title)

	existingQuestion := bson.M{}
	filter := bson.M{"$expr": bson.M{
		"$eq": []interface{}{
			bson.M{"$toLower": "$title"}, // Convert the title in the database to lowercase
			lowercaseTitle,               // Compare with the lowercase title
		},
	}}
	err = questionCollection.FindOne(context.TODO(), filter).Decode(&existingQuestion)
	if err == nil {
		// If we find a document, the title is already in use
		log.Println("A question with this title already exists")
		http.Error(w, "A question with this title already exists", http.StatusBadRequest)
		return
	} else if err != mongo.ErrNoDocuments {
		// If there is an error other than no documents found
		log.Println("Error checking for existing question:", err)
		http.Error(w, "Failed to check existing question", http.StatusInternalServerError)
		return
	}

	// Set creation and update timestamps
	question.CreatedAt = time.Now()
	question.UpdatedAt = time.Now()

	// Generate a UUID for the question
	question.QuestionID = uuid.New().String()

	// Insert the question into MongoDB
	result, err := questionCollection.InsertOne(context.TODO(), question)
	if err != nil {
		log.Println("Error inserting question into MongoDB:", err)
		http.Error(w, "Failed to create question", http.StatusInternalServerError)
		return
	}

	log.Println("Question inserted with ID:", result.InsertedID)
	json.NewEncoder(w).Encode(result.InsertedID)
}

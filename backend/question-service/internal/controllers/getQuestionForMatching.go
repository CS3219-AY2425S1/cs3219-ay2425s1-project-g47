package controllers

import (
	"context"
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"question-service/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetQuestion retrieves a random question based on complexity and category (topics)
func GetQuestion(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extract query parameters from the URL
	complexity := r.URL.Query().Get("complexity")
	categories := r.URL.Query()["categories"] // Get the array of categories

	// Log the parameters for debugging
	log.Printf("Received complexity: %s, categories: %v", complexity, categories)

	// Validate the parameters (ensure complexity and at least one category are provided)
	if complexity == "" || len(categories) == 0 {
		http.Error(w, "Invalid query parameters", http.StatusBadRequest)
		return
	}

	// Create filter for MongoDB based on complexity and categories
	filter := bson.M{
		"complexity": primitive.Regex{Pattern: complexity, Options: "i"},
		"category":   bson.M{"$in": regexArray(categories)},             
	}

	// Log the filter being used for MongoDB
	log.Printf("MongoDB query filter: %v", filter)

	// Query MongoDB to find all matching questions
	cursor, err := questionCollection.Find(context.TODO(), filter)
	if err != nil {
		log.Printf("Error finding questions: %v", err)
		http.Error(w, "Error retrieving questions", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	// Collect the matching questions into a slice
	var questions []models.Question
	for cursor.Next(context.TODO()) {
		var question models.Question
		if err := cursor.Decode(&question); err != nil {
			log.Printf("Error decoding question: %v", err)
			continue
		}
		questions = append(questions, question)
	}

	// If no questions are found, return a 404 response
	if len(questions) == 0 {
		log.Println("No suitable questions found, fetching a random question.")

		// Fetch all questions without any filters
		randomCursor, err := questionCollection.Aggregate(context.TODO(), bson.A{bson.M{"$sample": bson.M{"size": 1}}})
		if err != nil {
			log.Printf("Error finding random question: %v", err)
			http.Error(w, "Error retrieving random question", http.StatusInternalServerError)
			return
		}
		defer randomCursor.Close(context.TODO())

		var randomQuestions []models.Question
		for randomCursor.Next(context.TODO()) {
			var question models.Question
			if err := randomCursor.Decode(&question); err != nil {
				log.Printf("Error decoding random question: %v", err)
				continue
			}
			randomQuestions = append(randomQuestions, question)
		}

		// If no random question is found (highly unlikely), return a 404
		if len(randomQuestions) == 0 {
			http.Error(w, "No questions found", http.StatusNotFound)
			return
		}

		// Return the random question
		json.NewEncoder(w).Encode(randomQuestions[0])
		return
	}


	// Create a new random number generator with a source based on the current time
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	// Select a random question from the list
	selectedQuestion := questions[rng.Intn(len(questions))]

	// Send the selected question as a JSON response
	json.NewEncoder(w).Encode(selectedQuestion)
}

func regexArray(arr []string) []primitive.Regex {
	regexes := make([]primitive.Regex, len(arr))
	for i, item := range arr {
		regexes[i] = primitive.Regex{Pattern: item, Options: "i"}
	}
	return regexes
}
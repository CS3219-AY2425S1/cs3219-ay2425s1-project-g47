package controllers

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "strconv"
	"backend/internal/models"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo/options"
)

// GetAllQuestions handles the GET request to fetch all questions with pagination
func GetAllQuestions(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    // Get 'page' and 'limit' query parameters
    pageStr := r.URL.Query().Get("page")
    limitStr := r.URL.Query().Get("limit")

    // Set default values for page and limit
    page, err := strconv.Atoi(pageStr)
    if err != nil || page < 1 {
        page = 1 // Default to page 1
    }

    limit, err := strconv.Atoi(limitStr)
    if err != nil || limit < 1 {
        limit = 10 // Default to 10 questions per page
    }

	totalQuestions, err := questionCollection.CountDocuments(context.TODO(), bson.M{})
	if err != nil {
    	log.Println("Error counting documents:", err)
    	http.Error(w, "Failed to count questions", http.StatusInternalServerError)
    	return
	}

    // Calculate skip for MongoDB
    skip := (page - 1) * limit

    // Set MongoDB options to limit and skip the results
    findOptions := options.Find()
    findOptions.SetLimit(int64(limit))
    findOptions.SetSkip(int64(skip))

    // Fetch questions from the database
    cursor, err := questionCollection.Find(context.TODO(), bson.M{}, findOptions)
    if err != nil {
        log.Println("Error fetching questions:", err)
        http.Error(w, "Failed to fetch questions", http.StatusInternalServerError)
        return
    }

    // Convert the MongoDB cursor into a slice of questions
    var questions []models.Question
    if err = cursor.All(context.TODO(), &questions); err != nil {
        log.Println("Error decoding questions:", err)
        http.Error(w, "Failed to decode questions", http.StatusInternalServerError)
        return
    }

	totalPages := int((totalQuestions + int64(limit) - 1) / int64(limit))

	response := map[string]interface{}{
		"questions":   questions,
		"totalPages":  totalPages,
	}

    // Return the questions as JSON
    json.NewEncoder(w).Encode(response)
}

package routes

import (
	"question-service/internal/controllers"

	"github.com/gorilla/mux"
)

// RegisterQuestionRoutes defines the API routes for managing questions
func RegisterQuestionRoutes(router *mux.Router) {
	router.HandleFunc("/api/question-service/questions", controllers.CreateQuestion).Methods("POST")
	router.HandleFunc("/api/question-service/questions/{id}", controllers.UpdateQuestion).Methods("PUT")
	router.HandleFunc("/api/question-service/questions/{id}", controllers.DeleteQuestion).Methods("DELETE")
	router.HandleFunc("/api/question-service/questions/{id}", controllers.GetQuestionByID).Methods("GET")
	router.HandleFunc("/api/question-service/questions", controllers.GetAllQuestions).Methods("GET")
}

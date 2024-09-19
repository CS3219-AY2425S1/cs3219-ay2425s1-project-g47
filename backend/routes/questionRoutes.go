package routes

import (
	"backend/controllers"

	"github.com/gorilla/mux"
)

// RegisterQuestionRoutes defines the API routes for managing questions
func RegisterQuestionRoutes(router *mux.Router) {
	router.HandleFunc("/api/questions", controllers.CreateQuestion).Methods("POST")
	router.HandleFunc("/api/questions/{id}", controllers.UpdateQuestion).Methods("PUT")
	router.HandleFunc("/api/questions/{id}", controllers.DeleteQuestion).Methods("DELETE")
}

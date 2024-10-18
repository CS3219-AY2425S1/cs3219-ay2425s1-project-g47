package routes

import (
	"net/http"
	
	"question-service/internal/controllers"
	"question-service/internal/middleware"

	"github.com/gorilla/mux"
)

// RegisterQuestionRoutes defines the API routes for managing questions
func RegisterQuestionRoutes(router *mux.Router) {
	// Public routes (GET requests)
	router.Handle("/questions", middleware.VerifyAccessToken(http.HandlerFunc(controllers.GetAllQuestions))).Methods("GET")
	router.Handle("/questions/{id}", middleware.VerifyAccessToken(http.HandlerFunc(controllers.GetQuestionByID))).Methods("GET")

	// Admin-only routes (POST, PUT, DELETE requests)
	router.Handle("/questions", middleware.ProtectAdmin(http.HandlerFunc(controllers.CreateQuestion))).Methods("POST")
	router.Handle("/questions/{id}", middleware.ProtectAdmin(http.HandlerFunc(controllers.UpdateQuestion))).Methods("PUT")
	router.Handle("/questions/{id}", middleware.ProtectAdmin(http.HandlerFunc(controllers.DeleteQuestion))).Methods("DELETE")
}

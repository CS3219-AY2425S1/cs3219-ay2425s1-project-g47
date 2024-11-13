package middleware

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"time"

	"question-service/internal/models"
	"github.com/dgrijalva/jwt-go"
)

type key int

const (
	// UserKey for storing user in the context
	UserKey key = iota
)

// VerifyAccessToken middleware for JWT authentication, extracting token from the cookie
func VerifyAccessToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extract the access token from the 'accessToken' cookie
		cookie, err := r.Cookie("accessToken")
		if err != nil {
			log.Println("Access token cookie missing or invalid")
			http.Error(w, "Unauthorized, no access token", http.StatusUnauthorized)
			return
		}

		// Authenticate the access token from the cookie value
		token, err := authenticateAccessToken(cookie.Value)
		if err != nil {
			log.Printf("Failed to authenticate token: %v", err)
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Check if the token is valid and print out the claims
		if claims, ok := token.Claims.(*models.JwtPayload); ok && token.Valid {
			// Add the entire JwtPayload object to the request context
			ctx := context.WithValue(r.Context(), UserKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
		}
	})
}

// ProtectAdmin middleware ensures that only admin users can access the route
func ProtectAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Retrieve the JwtPayload directly from the context (must have passed VerifyAccessToken first)
		claims, ok := r.Context().Value(UserKey).(*models.JwtPayload)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Debug: Print the whole JwtPayload object for debugging
		log.Printf("JWT Payload: %+v", claims)

		// Check if the user is an admin
		if !claims.IsAdmin {
			log.Printf("User %s (ID: %s) is not an admin", claims.Username, claims.ID.Hex())
			http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
			return
		}

		// User is an admin, allow access
		next.ServeHTTP(w, r)
	})
}

// authenticateAccessToken verifies the JWT token and returns the parsed token
func authenticateAccessToken(tokenString string) (*jwt.Token, error) {
	// Parse the token with the correct claims
	token, err := jwt.ParseWithClaims(tokenString, &models.JwtPayload{}, func(token *jwt.Token) (interface{}, error) {
		// Check signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		// Return the JWT_SECRET from environment variable
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	// Return any parsing errors
	if err != nil {
		return nil, err
	}

	// Ensure the token is valid
	if claims, ok := token.Claims.(*models.JwtPayload); ok && token.Valid {
		// Check if the token has expired
		if time.Now().Unix() > claims.Exp {
			log.Printf("Token has expired. Current time: %d, Expiration time: %d", time.Now().Unix(), claims.Exp)
			return nil, errors.New("token has expired")
		}
		return token, nil
	}

	return nil, errors.New("invalid token")
}

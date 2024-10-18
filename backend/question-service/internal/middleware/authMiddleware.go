package middleware

import (
	"context"
	"errors"
	"net/http"
	"os"
	"time"

	"question-service/internal/models"
	"github.com/dgrijalva/jwt-go"
)

// ContextKey is a custom type for storing values in the context
type ContextKey string

// UserContextKey is the key for storing the user in the request context
var UserContextKey = ContextKey("user")

func ProtectAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the accessToken from the cookie
		accessToken, err := r.Cookie("accessToken")
		if err != nil {
			http.Error(w, "Not authorized, no access token", http.StatusUnauthorized)
			return
		}

		// Authenticate the accessToken
		token, err := authenticateAccessToken(accessToken.Value)
		if err != nil {
			http.Error(w, "Not authorized, access token failed", http.StatusUnauthorized)
			return
		}

		// Verify user role is ADMIN
		if claims, ok := token.Claims.(*models.JwtPayload); ok && token.Valid {
			if claims.User.Role == "ADMIN" {
				next.ServeHTTP(w, r)
			} else {
				http.Error(w, "Not admin authorized, token failed", http.StatusUnauthorized)
			}
		} else {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
		}
	})
}


// verifyAccessToken checks the validity of the JWT token
func VerifyAccessToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if the accessToken is provided (accessToken cookie)
		accessToken, err := r.Cookie("accessToken")
		if err != nil {
			http.Error(w, "Not authorized, no access token", http.StatusUnauthorized)
			return
		}

		// Authenticate the accessToken
		token, err := authenticateAccessToken(accessToken.Value)
		if err != nil {
			http.Error(w, "Not authorized, access token failed", http.StatusUnauthorized)
			return
		}

		// Store the user in the context
		if claims, ok := token.Claims.(*models.JwtPayload); ok && token.Valid {
			ctx := context.WithValue(r.Context(), UserContextKey, claims.User)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
		}
	})
}

func authenticateAccessToken(tokenString string) (*jwt.Token, error) {
	// Parse the token
	token, err := jwt.ParseWithClaims(tokenString, &models.JwtPayload{}, func(token *jwt.Token) (interface{}, error) {
		// Check signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	// Check for parsing errors or invalid token
	if err != nil {	
		return nil, err
	}

	// Check if token is expired
	if claims, ok := token.Claims.(*models.JwtPayload); ok && token.Valid {
		if time.Now().Unix() > claims.Exp {
			return nil, errors.New("token has expired")
		}
		return token, nil
	}

	return nil, errors.New("invalid token")
}

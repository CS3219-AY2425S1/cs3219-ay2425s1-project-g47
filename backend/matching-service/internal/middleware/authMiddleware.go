package middleware

import (
	"errors"
	"log"
	"net/http"
	"os"
	"time"

	"matching-service/internal/models"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

// VerifyAccessToken checks the validity of the JWT token for Gin context
func VerifyAccessToken(c *gin.Context) {
	// Extract the access token from the 'accessToken' cookie
	accessToken, err := c.Cookie("accessToken")
	if err != nil {
		log.Println("Access token cookie missing or invalid")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized, no access token"})
		c.Abort() // Stop further processing
		return
	}

	// Authenticate the access token from the cookie value
	token, err := authenticateAccessToken(accessToken)
	if err != nil {
		log.Printf("Failed to authenticate token: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		c.Abort() // Stop further processing
		return
	}

	// Store the user information in the Gin context if the token is valid
	if claims, ok := token.Claims.(*models.JwtPayload); ok && token.Valid {
		log.Printf("Token is valid for user: %s (ID: %s)", claims.User.Username, claims.User.ID.Hex())
		// Store the user in the Gin context for access in subsequent handlers
		c.Set("user", claims.User)
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		c.Abort() // Stop further processing
		return
	}

	// Continue to the next handler in the chain
	c.Next()
}

// authenticateAccessToken verifies the JWT token and returns the parsed token
func authenticateAccessToken(tokenString string) (*jwt.Token, error) {
	// Parse the token with the expected claims
	token, err := jwt.ParseWithClaims(tokenString, &models.JwtPayload{}, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is HMAC (e.g., HS256)
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		// Return the JWT secret to validate the token signature
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	// Return any errors that occurred during parsing
	if err != nil {
		return nil, err
	}

	// Ensure the token is still valid (i.e., not expired)
	if claims, ok := token.Claims.(*models.JwtPayload); ok && token.Valid {
		if time.Now().Unix() > claims.Exp {
			log.Printf("Token has expired. Current time: %d, Expiration time: %d", time.Now().Unix(), claims.Exp)
			return nil, errors.New("token has expired")
		}
		// Return the valid token
		return token, nil
	}

	// Return an error if the token is invalid
	return nil, errors.New("invalid token")
}

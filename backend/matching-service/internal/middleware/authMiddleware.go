package middleware

import (
	"errors"
	"net/http"
	"os"
	"time"

	"matching-service/internal/models"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

// VerifyAccessToken checks the validity of the JWT token for Gin context
func VerifyAccessToken(c *gin.Context) {
	// Check if the accessToken is provided (accessToken cookie)
	accessToken, err := c.Cookie("accessToken")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized, no access token"})
		c.Abort() // Stop the handler chain and respond with an error
		return
	}

	// Authenticate the accessToken
	token, err := authenticateAccessToken(accessToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized, access token failed"})
		c.Abort() // Stop the handler chain and respond with an error
		return
	}

	// Store the user information in the context if the token is valid
	if claims, ok := token.Claims.(*models.JwtPayload); ok && token.Valid {
		c.Set("user", claims.User) // Store user info in Gin context
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		c.Abort() // Stop the handler chain and respond with an error
		return
	}

	c.Next() // Proceed to the next handler
}

// authenticateAccessToken verifies the JWT token and returns the parsed token
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

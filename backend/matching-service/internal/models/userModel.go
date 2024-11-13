package models

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UserWithoutPassword struct to match the payload (excluding password)
type UserWithoutPassword struct {
	ID        primitive.ObjectID `json:"id" bson:"id"` // MongoDB ObjectID
	Username  string             `json:"username" bson:"username"`
	Email     string             `json:"email" bson:"email"`
	IsAdmin   bool               `json:"isAdmin" bson:"isAdmin"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}

// JwtPayload struct to match the JWT payload
type JwtPayload struct {
	User UserWithoutPassword `json:"user"`
	Exp  int64               `json:"exp"`
	Iat  int64               `json:"iat"`
}

// Valid function to check if the token is expired
func (p JwtPayload) Valid() error {
	if p.Exp < time.Now().Unix() {
		return errors.New("token has expired")
	}
	return nil
}


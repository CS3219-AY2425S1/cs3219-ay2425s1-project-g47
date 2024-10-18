package models

import (
	"errors"
	"time"
)

// UserWithoutPassword struct to match the payload
type UserWithoutPassword struct {
	ID   int    `json:"id"`
	Role string `json:"role"`
}

// JwtPayload struct to match the JWT payload
type JwtPayload struct {
	User UserWithoutPassword `json:"user"`
	Exp  int64               `json:"exp"`
	Iat  int64               `json:"iat"`
}


func (p JwtPayload) Valid() error {
	if p.Exp < time.Now().Unix() {
		return errors.New("token has expired")
	}
	return nil
}
package models

import "time"

type Question struct {
	QuestionID  string    `json:"questionId"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Constraints string    `json:"constraints"`
	Examples    string    `json:"examples"`
	Category    []string  `json:"category"`
	Complexity  string    `json:"complexity"`
	ImageURL    string    `json:"imageUrl"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

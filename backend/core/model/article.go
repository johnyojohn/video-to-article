package model

import "time"

type Article struct {
	ID        string    `json:"id"`
	VideoName string    `json:"videoName"`
	Content   string    `json:"content"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"createdAt"`
}

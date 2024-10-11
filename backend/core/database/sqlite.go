package database

import (
	"database/sql"
	"errors"
	"log"

	"video-to-article/backend/core/model"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func InitDB() {
	var err error
	db, err = sql.Open("sqlite3", "./video_articles.db")
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS articles (
			id TEXT PRIMARY KEY,
			video_name TEXT,
			content TEXT,
			title TEXT,
			created_at DATETIME
		)
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func SaveArticle(article *model.Article) error {
	if db == nil {
		return errors.New("database connection is not initialized")
	}

	_, err := db.Exec(`
		INSERT INTO articles (id, video_name, content, title, created_at)
		VALUES (?, ?, ?, ?, ?)
	`, article.ID, article.VideoName, article.Content, article.Title, article.CreatedAt)
	return err
}

func GetArticle(id string) (*model.Article, error) {
	var article model.Article

	err := db.QueryRow(`
		SELECT id, video_name, content, title, created_at
		FROM articles
		WHERE id = ?
	`, id).Scan(&article.ID, &article.VideoName, &article.Content, &article.Title, &article.CreatedAt)

	if err != nil {
		return nil, err
	}

	return &article, nil
}

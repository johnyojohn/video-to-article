package main

import (
	"log"
	"net/http"
	"os"
	"video-to-article/backend/core/database"
	"video-to-article/backend/graph"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/rs/cors"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	database.InitDB()

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	// Create a new CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:*"}, // Add your frontend URL here
		AllowCredentials: true,
		Debug:            true,
	})

	// Create a new ServeMux
	mux := http.NewServeMux()

	// Add routes to the ServeMux
	mux.Handle("/", playground.Handler("GraphQL playground", "/query"))
	mux.Handle("/query", srv)

	// Wrap the ServeMux with the CORS middleware
	handler := c.Handler(mux)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

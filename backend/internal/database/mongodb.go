package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var client *mongo.Client

// Connect establishes a connection to MongoDB
func Connect(uri string, dbName string) (*mongo.Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	clientOptions := options.Client().
		ApplyURI(uri).
		SetMaxPoolSize(50).
		SetMinPoolSize(5).
		SetMaxConnIdleTime(30 * time.Second)

	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Ping to verify connection
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}

	log.Printf("📦 Connected to database: %s", dbName)
	return client.Database(dbName), nil
}

// Disconnect gracefully closes the MongoDB connection
func Disconnect(ctx context.Context) {
	if client != nil {
		if err := client.Disconnect(ctx); err != nil {
			log.Printf("⚠️  Error disconnecting from MongoDB: %v", err)
		}
	}
}

// GetClient returns the MongoDB client
func GetClient() *mongo.Client {
	return client
}

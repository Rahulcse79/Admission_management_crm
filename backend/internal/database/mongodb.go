package database

import (
	"context"
	"fmt"
	"log"
	"net"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var client *mongo.Client

func init() {
	// Fix macOS DNS resolution issue with mongodb+srv:// URIs.
	// macOS sometimes routes SRV lookups through an IPv6 link-local address
	// which cannot unmarshal the DNS response. Force Go to use its own
	// pure-Go resolver with an explicit fallback to Google / Cloudflare DNS.
	net.DefaultResolver = &net.Resolver{
		PreferGo: true,
		Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
			d := net.Dialer{Timeout: 5 * time.Second}
			// Try the system resolver first
			conn, err := d.DialContext(ctx, "udp", "8.8.8.8:53")
			if err != nil {
				// Fallback to Cloudflare
				conn, err = d.DialContext(ctx, "udp", "1.1.1.1:53")
			}
			return conn, err
		},
	}
}

// Connect establishes a connection to MongoDB with retry logic.
func Connect(uri string, dbName string) (*mongo.Database, error) {
	// Mask the URI for logging (hide password)
	maskedURI := maskURI(uri)
	log.Printf("🔌 Connecting to MongoDB: %s", maskedURI)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	clientOptions := options.Client().
		ApplyURI(uri).
		SetMaxPoolSize(50).
		SetMinPoolSize(5).
		SetMaxConnIdleTime(30 * time.Second).
		SetConnectTimeout(10 * time.Second).
		SetServerSelectionTimeout(15 * time.Second).
		SetRetryWrites(true).
		SetRetryReads(true)

	var err error

	// Retry connection up to 3 times
	maxRetries := 3
	for attempt := 1; attempt <= maxRetries; attempt++ {
		client, err = mongo.Connect(ctx, clientOptions)
		if err != nil {
			log.Printf("⚠️  Connection attempt %d/%d failed: %v", attempt, maxRetries, err)
			if attempt < maxRetries {
				time.Sleep(time.Duration(attempt*2) * time.Second)
				continue
			}
			return nil, fmt.Errorf("failed to connect after %d attempts: %w", maxRetries, err)
		}

		// Ping to verify connection
		pingCtx, pingCancel := context.WithTimeout(context.Background(), 10*time.Second)
		if pingErr := client.Ping(pingCtx, readpref.Primary()); pingErr != nil {
			pingCancel()
			log.Printf("⚠️  Ping attempt %d/%d failed: %v", attempt, maxRetries, pingErr)
			_ = client.Disconnect(ctx)
			if attempt < maxRetries {
				time.Sleep(time.Duration(attempt*2) * time.Second)
				continue
			}
			return nil, fmt.Errorf("failed to ping MongoDB after %d attempts: %w", maxRetries, pingErr)
		}
		pingCancel()

		// Success
		log.Printf("📦 Connected to database: %s", dbName)
		return client.Database(dbName), nil
	}

	return nil, fmt.Errorf("failed to connect to MongoDB after %d retries", maxRetries)
}

// Disconnect gracefully closes the MongoDB connection
func Disconnect(ctx context.Context) {
	if client != nil {
		if err := client.Disconnect(ctx); err != nil {
			log.Printf("⚠️  Error disconnecting from MongoDB: %v", err)
		} else {
			log.Println("📦 Disconnected from MongoDB")
		}
	}
}

// GetClient returns the MongoDB client
func GetClient() *mongo.Client {
	return client
}

// maskURI hides sensitive credentials from the connection URI for logging
func maskURI(uri string) string {
	if idx := strings.Index(uri, "://"); idx > 0 {
		rest := uri[idx+3:]
		if atIdx := strings.Index(rest, "@"); atIdx > 0 {
			return uri[:idx+3] + "***:***@" + rest[atIdx+1:]
		}
	}
	return uri
}

package config

import (
	"log"
	"os"
	"path/filepath"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	Port          string
	MongoURI      string
	MongoDB       string
	JWTSecret     string
	JWTExpiry     int
	CORSOrigins   string
	GinMode       string
	AdminEmail    string
	AdminPassword string
	AdminName     string
}

// Load reads configuration from environment variables.
// It automatically loads .env from the project root (one level above backend/).
func Load() *Config {
	// Try loading .env from multiple likely locations
	envPaths := []string{
		".env",                                  // current dir
		"../.env",                               // one level up
		filepath.Join("..", "..", ".env"),       // two levels up (backend/)
		filepath.Join("..", "..", "..", ".env"), // three levels up (backend/cmd/server/)
		filepath.Join("..", "..", "..", "..", ".env"), // four levels up (just in case)
	}
	for _, p := range envPaths {
		if err := godotenv.Load(p); err == nil {
			log.Printf("📄 Loaded env from: %s", p)
			break
		}
	}

	jwtExpiry := 24
	if v := getEnv("JWT_EXPIRY_HOURS", "24"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			jwtExpiry = parsed
		}
	}

	return &Config{
		Port:          getEnv("PORT", "8080"),
		MongoURI:      getEnv("MONGODB_URI", "mongodb://localhost:27017/admission_crm"),
		MongoDB:       getEnv("MONGODB_DATABASE", "admission_crm"),
		JWTSecret:     getEnv("JWT_SECRET", "default-secret-change-me"),
		JWTExpiry:     jwtExpiry,
		CORSOrigins:   getEnv("CORS_ORIGINS", "http://localhost:3000,https://admission-management-crm-2.onrender.com"),
		GinMode:       getEnv("GIN_MODE", "debug"),
		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@edumerge.com"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "Admin@123"),
		AdminName:     getEnv("ADMIN_NAME", "System Admin"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

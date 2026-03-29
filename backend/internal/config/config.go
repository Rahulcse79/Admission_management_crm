package config

import (
	"os"
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
}

// Load reads configuration from environment variables
func Load() *Config {
	return &Config{
		Port:          getEnv("PORT", "8080"),
		MongoURI:      getEnv("MONGODB_URI", "mongodb://localhost:27017/admission_crm"),
		MongoDB:       getEnv("MONGODB_DATABASE", "admission_crm"),
		JWTSecret:     getEnv("JWT_SECRET", "default-secret-change-me"),
		JWTExpiry:     24,
		CORSOrigins:   getEnv("CORS_ORIGINS", "http://localhost:3000"),
		GinMode:       getEnv("GIN_MODE", "debug"),
		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@edumerge.com"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "Admin@123"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

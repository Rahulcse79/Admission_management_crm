package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rahulsingh/admission-crm-backend/internal/config"
	"github.com/rahulsingh/admission-crm-backend/internal/database"
	"github.com/rahulsingh/admission-crm-backend/internal/handlers"
	"github.com/rahulsingh/admission-crm-backend/internal/repository"
	"github.com/rahulsingh/admission-crm-backend/internal/router"
	"github.com/rahulsingh/admission-crm-backend/internal/services"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to MongoDB
	db, err := database.Connect(cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("❌ Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		database.Disconnect(ctx)
	}()

	log.Println("✅ Connected to MongoDB")

	// Initialize layers
	repos := repository.NewRepositories(db)
	svcs := services.NewServices(repos, cfg)
	hdlrs := handlers.NewHandlers(svcs)

	// Seed admin user
	if err := svcs.Auth.SeedAdmin(cfg.AdminEmail, cfg.AdminPassword); err != nil {
		log.Printf("⚠️  Admin seed: %v", err)
	}

	// Setup router
	r := router.Setup(hdlrs, svcs.Auth, cfg)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		log.Printf("🚀 Server starting on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("❌ Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server exited gracefully")
}

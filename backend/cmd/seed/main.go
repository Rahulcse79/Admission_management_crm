package seed
package main

import (
	"context"
	"log"
	"time"

	"github.com/rahulsingh/admission-crm-backend/internal/config"
	"github.com/rahulsingh/admission-crm-backend/internal/database"
	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("❌ Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		database.Disconnect(ctx)
	}()

	ctx := context.Background()

	// Seed Admin User
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
	admin := models.User{
		ID:        primitive.NewObjectID(),
		Name:      "System Admin",
		Email:     cfg.AdminEmail,
		Password:  string(hashedPassword),
		Role:      models.RoleAdmin,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = db.Collection("users").InsertOne(ctx, admin)
	if err != nil {
		log.Printf("⚠️  Admin may already exist: %v", err)
	} else {
		log.Println("✅ Admin user seeded")
	}

	// Seed Admission Officer
	hashedPassword2, _ := bcrypt.GenerateFromPassword([]byte("Officer@123"), bcrypt.DefaultCost)
	officer := models.User{
		ID:        primitive.NewObjectID(),
		Name:      "Admission Officer",
		Email:     "officer@edumerge.com",
		Password:  string(hashedPassword2),
		Role:      models.RoleAdmissionOfficer,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = db.Collection("users").InsertOne(ctx, officer)
	if err != nil {
		log.Printf("⚠️  Officer may already exist: %v", err)
	} else {
		log.Println("✅ Admission Officer seeded")
	}

	// Seed Management User
	hashedPassword3, _ := bcrypt.GenerateFromPassword([]byte("Mgmt@123"), bcrypt.DefaultCost)
	mgmt := models.User{
		ID:        primitive.NewObjectID(),
		Name:      "Management Viewer",
		Email:     "management@edumerge.com",
		Password:  string(hashedPassword3),
		Role:      models.RoleManagement,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = db.Collection("users").InsertOne(ctx, mgmt)
	if err != nil {
		log.Printf("⚠️  Management user may already exist: %v", err)
	} else {
		log.Println("✅ Management user seeded")
	}

	// Seed Academic Year
	ay := models.AcademicYear{
		ID:        primitive.NewObjectID(),
		Year:      "2026-27",
		StartDate: time.Date(2026, 6, 1, 0, 0, 0, 0, time.UTC),
		EndDate:   time.Date(2027, 5, 31, 0, 0, 0, 0, time.UTC),
		IsCurrent: true,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = db.Collection("academic_years").InsertOne(ctx, ay)
	if err != nil {
		log.Printf("⚠️  Academic year may already exist: %v", err)
	} else {
		log.Println("✅ Academic year 2026-27 seeded")
	}

	log.Println("🎉 Seeding completed!")
}

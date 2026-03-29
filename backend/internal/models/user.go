package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ─── User Roles ──────────────────────────────────

type Role string

const (
	RoleAdmin            Role = "admin"
	RoleAdmissionOfficer Role = "admission_officer"
	RoleManagement       Role = "management"
)

// ─── User ────────────────────────────────────────

type User struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name" binding:"required"`
	Email     string             `json:"email" bson:"email" binding:"required,email"`
	Password  string             `json:"-" bson:"password"`
	Role      Role               `json:"role" bson:"role" binding:"required"`
	IsActive  bool               `json:"is_active" bson:"is_active"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

// ─── Auth DTOs ───────────────────────────────────

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     Role   `json:"role" binding:"required"`
}

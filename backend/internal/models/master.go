package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ─── Institution ─────────────────────────────────

type Institution struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name" binding:"required"`
	Code      string             `json:"code" bson:"code" binding:"required"`
	Address   string             `json:"address" bson:"address"`
	Phone     string             `json:"phone" bson:"phone"`
	Email     string             `json:"email" bson:"email"`
	Website   string             `json:"website" bson:"website"`
	IsActive  bool               `json:"is_active" bson:"is_active"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

// ─── Campus ──────────────────────────────────────

type Campus struct {
	ID            primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	InstitutionID primitive.ObjectID `json:"institution_id" bson:"institution_id" binding:"required"`
	Name          string             `json:"name" bson:"name" binding:"required"`
	Code          string             `json:"code" bson:"code" binding:"required"`
	Address       string             `json:"address" bson:"address"`
	IsActive      bool               `json:"is_active" bson:"is_active"`
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at" bson:"updated_at"`

	// Virtual (populated)
	InstitutionName string `json:"institution_name,omitempty" bson:"-"`
}

// ─── Department ──────────────────────────────────

type Department struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	CampusID  primitive.ObjectID `json:"campus_id" bson:"campus_id" binding:"required"`
	Name      string             `json:"name" bson:"name" binding:"required"`
	Code      string             `json:"code" bson:"code" binding:"required"`
	IsActive  bool               `json:"is_active" bson:"is_active"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`

	// Virtual
	CampusName string `json:"campus_name,omitempty" bson:"-"`
}

// ─── Program / Branch ────────────────────────────

type CourseType string

const (
	CourseTypeUG CourseType = "UG"
	CourseTypePG CourseType = "PG"
)

type EntryType string

const (
	EntryTypeRegular EntryType = "Regular"
	EntryTypeLateral EntryType = "Lateral"
)

type AdmissionMode string

const (
	AdmissionModeGovernment AdmissionMode = "Government"
	AdmissionModeManagement AdmissionMode = "Management"
)

type Program struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	DepartmentID primitive.ObjectID `json:"department_id" bson:"department_id" binding:"required"`
	Name         string             `json:"name" bson:"name" binding:"required"`
	Code         string             `json:"code" bson:"code" binding:"required"`
	CourseType   CourseType         `json:"course_type" bson:"course_type" binding:"required"`
	Duration     int                `json:"duration" bson:"duration"` // in years
	IsActive     bool               `json:"is_active" bson:"is_active"`
	CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time          `json:"updated_at" bson:"updated_at"`

	// Virtual
	DepartmentName string `json:"department_name,omitempty" bson:"-"`
}

// ─── Academic Year ───────────────────────────────

type AcademicYear struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Year      string             `json:"year" bson:"year" binding:"required"` // e.g., "2026-27"
	StartDate time.Time          `json:"start_date" bson:"start_date"`
	EndDate   time.Time          `json:"end_date" bson:"end_date"`
	IsCurrent bool               `json:"is_current" bson:"is_current"`
	IsActive  bool               `json:"is_active" bson:"is_active"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

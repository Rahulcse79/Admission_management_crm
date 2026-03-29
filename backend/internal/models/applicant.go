package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ─── Category ────────────────────────────────────

type Category string

const (
	CategoryGM  Category = "GM"
	CategorySC  Category = "SC"
	CategoryST  Category = "ST"
	CategoryOBC Category = "OBC"
	Category2A  Category = "2A"
	Category2B  Category = "2B"
	Category3A  Category = "3A"
	Category3B  Category = "3B"
)

// ─── Document Status ─────────────────────────────

type DocStatus string

const (
	DocStatusPending   DocStatus = "Pending"
	DocStatusSubmitted DocStatus = "Submitted"
	DocStatusVerified  DocStatus = "Verified"
)

// ─── Document ────────────────────────────────────

type Document struct {
	Name   string    `json:"name" bson:"name"`
	Status DocStatus `json:"status" bson:"status"`
}

// ─── Fee Status ──────────────────────────────────

type FeeStatus string

const (
	FeeStatusPending FeeStatus = "Pending"
	FeeStatusPaid    FeeStatus = "Paid"
)

// ─── Applicant ───────────────────────────────────

type Applicant struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ApplicationNumber string             `json:"application_number" bson:"application_number"`
	FirstName         string             `json:"first_name" bson:"first_name" binding:"required"`
	LastName          string             `json:"last_name" bson:"last_name" binding:"required"`
	Email             string             `json:"email" bson:"email" binding:"required,email"`
	Phone             string             `json:"phone" bson:"phone" binding:"required"`
	DateOfBirth       time.Time          `json:"date_of_birth" bson:"date_of_birth"`
	Gender            string             `json:"gender" bson:"gender"`
	Category          Category           `json:"category" bson:"category" binding:"required"`
	Address           string             `json:"address" bson:"address"`
	ProgramID         primitive.ObjectID `json:"program_id" bson:"program_id" binding:"required"`
	AcademicYearID    primitive.ObjectID `json:"academic_year_id" bson:"academic_year_id"`
	EntryType         EntryType          `json:"entry_type" bson:"entry_type" binding:"required"`
	QuotaType         QuotaType          `json:"quota_type" bson:"quota_type" binding:"required"`
	AdmissionMode     AdmissionMode      `json:"admission_mode" bson:"admission_mode" binding:"required"`
	AllotmentNumber   string             `json:"allotment_number,omitempty" bson:"allotment_number,omitempty"`
	QualifyingExam    string             `json:"qualifying_exam" bson:"qualifying_exam"`
	Marks             float64            `json:"marks" bson:"marks"`
	Rank              int                `json:"rank,omitempty" bson:"rank,omitempty"`
	Documents         []Document         `json:"documents" bson:"documents"`
	FeeStatus         FeeStatus          `json:"fee_status" bson:"fee_status"`
	Status            string             `json:"status" bson:"status"` // Applied, SeatAllocated, Admitted, Rejected
	IsActive          bool               `json:"is_active" bson:"is_active"`
	CreatedAt         time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at" bson:"updated_at"`

	// Virtual
	ProgramName  string `json:"program_name,omitempty" bson:"-"`
	AcademicYear string `json:"academic_year,omitempty" bson:"-"`
}

// ─── Applicant Create DTO ───────────────────────

type ApplicantRequest struct {
	FirstName       string        `json:"first_name" binding:"required"`
	LastName        string        `json:"last_name" binding:"required"`
	Email           string        `json:"email" binding:"required,email"`
	Phone           string        `json:"phone" binding:"required"`
	DateOfBirth     string        `json:"date_of_birth"`
	Gender          string        `json:"gender"`
	Category        Category      `json:"category" binding:"required"`
	Address         string        `json:"address"`
	ProgramID       string        `json:"program_id" binding:"required"`
	AcademicYearID  string        `json:"academic_year_id"`
	EntryType       EntryType     `json:"entry_type" binding:"required"`
	QuotaType       QuotaType     `json:"quota_type" binding:"required"`
	AdmissionMode   AdmissionMode `json:"admission_mode" binding:"required"`
	AllotmentNumber string        `json:"allotment_number"`
	QualifyingExam  string        `json:"qualifying_exam"`
	Marks           float64       `json:"marks"`
	Rank            int           `json:"rank"`
}

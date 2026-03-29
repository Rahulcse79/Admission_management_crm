package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ─── Quota Types ─────────────────────────────────

type QuotaType string

const (
	QuotaKCET       QuotaType = "KCET"
	QuotaCOMEDK     QuotaType = "COMEDK"
	QuotaManagement QuotaType = "Management"
)

// ─── Quota Allocation ────────────────────────────

type QuotaAllocation struct {
	QuotaType      QuotaType `json:"quota_type" bson:"quota_type"`
	TotalSeats     int       `json:"total_seats" bson:"total_seats"`
	FilledSeats    int       `json:"filled_seats" bson:"filled_seats"`
	RemainingSeats int       `json:"remaining_seats" bson:"remaining_seats"`
}

// ─── Supernumerary Seats ─────────────────────────

type SupernumerarySeats struct {
	Category  string `json:"category" bson:"category"` // e.g., "J&K", "Foreign"
	MaxSeats  int    `json:"max_seats" bson:"max_seats"`
	UsedSeats int    `json:"used_seats" bson:"used_seats"`
}

// ─── Seat Matrix ─────────────────────────────────

type SeatMatrix struct {
	ID             primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	ProgramID      primitive.ObjectID   `json:"program_id" bson:"program_id" binding:"required"`
	AcademicYearID primitive.ObjectID   `json:"academic_year_id" bson:"academic_year_id" binding:"required"`
	TotalIntake    int                  `json:"total_intake" bson:"total_intake" binding:"required"`
	Quotas         []QuotaAllocation    `json:"quotas" bson:"quotas"`
	Supernumerary  []SupernumerarySeats `json:"supernumerary,omitempty" bson:"supernumerary,omitempty"`
	TotalFilled    int                  `json:"total_filled" bson:"total_filled"`
	TotalRemaining int                  `json:"total_remaining" bson:"total_remaining"`
	IsActive       bool                 `json:"is_active" bson:"is_active"`
	CreatedAt      time.Time            `json:"created_at" bson:"created_at"`
	UpdatedAt      time.Time            `json:"updated_at" bson:"updated_at"`

	// Virtual
	ProgramName  string `json:"program_name,omitempty" bson:"-"`
	AcademicYear string `json:"academic_year,omitempty" bson:"-"`
}

// ─── Seat Matrix Create/Update DTO ──────────────

type SeatMatrixRequest struct {
	ProgramID      string               `json:"program_id" binding:"required"`
	AcademicYearID string               `json:"academic_year_id" binding:"required"`
	TotalIntake    int                  `json:"total_intake" binding:"required,min=1"`
	Quotas         []QuotaAllocation    `json:"quotas" binding:"required"`
	Supernumerary  []SupernumerarySeats `json:"supernumerary,omitempty"`
}

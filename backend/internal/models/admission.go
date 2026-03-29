package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ─── Admission ───────────────────────────────────

type Admission struct {
	ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AdmissionNumber string             `json:"admission_number" bson:"admission_number"`
	ApplicantID     primitive.ObjectID `json:"applicant_id" bson:"applicant_id"`
	ProgramID       primitive.ObjectID `json:"program_id" bson:"program_id"`
	AcademicYearID  primitive.ObjectID `json:"academic_year_id" bson:"academic_year_id"`
	QuotaType       QuotaType          `json:"quota_type" bson:"quota_type"`
	EntryType       EntryType          `json:"entry_type" bson:"entry_type"`
	AdmissionMode   AdmissionMode      `json:"admission_mode" bson:"admission_mode"`
	FeeStatus       FeeStatus          `json:"fee_status" bson:"fee_status"`
	IsConfirmed     bool               `json:"is_confirmed" bson:"is_confirmed"`
	ConfirmedAt     *time.Time         `json:"confirmed_at,omitempty" bson:"confirmed_at,omitempty"`
	CreatedAt       time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at" bson:"updated_at"`

	// Virtual
	ApplicantName string `json:"applicant_name,omitempty" bson:"-"`
	ProgramName   string `json:"program_name,omitempty" bson:"-"`
	ProgramCode   string `json:"program_code,omitempty" bson:"-"`
	AcademicYear  string `json:"academic_year,omitempty" bson:"-"`
}

// ─── Seat Allocation Request ────────────────────

type AllocateSeatRequest struct {
	ApplicantID string `json:"applicant_id" binding:"required"`
}

// ─── Confirm Admission Request ──────────────────

type ConfirmAdmissionRequest struct {
	AdmissionID string `json:"admission_id" binding:"required"`
}

// ─── Update Fee Status Request ──────────────────

type UpdateFeeRequest struct {
	FeeStatus FeeStatus `json:"fee_status" binding:"required"`
}

// ─── Dashboard Stats ────────────────────────────

type DashboardStats struct {
	TotalIntake      int           `json:"total_intake"`
	TotalAdmitted    int           `json:"total_admitted"`
	TotalPending     int           `json:"total_pending"`
	TotalRemaining   int           `json:"total_remaining"`
	QuotaWiseStats   []QuotaStat   `json:"quota_wise_stats"`
	ProgramWiseStats []ProgramStat `json:"program_wise_stats"`
	PendingDocuments int           `json:"pending_documents"`
	PendingFees      int           `json:"pending_fees"`
	RecentAdmissions []Admission   `json:"recent_admissions"`
}

type QuotaStat struct {
	QuotaType      QuotaType `json:"quota_type"`
	TotalSeats     int       `json:"total_seats"`
	FilledSeats    int       `json:"filled_seats"`
	RemainingSeats int       `json:"remaining_seats"`
}

type ProgramStat struct {
	ProgramID   primitive.ObjectID `json:"program_id"`
	ProgramName string             `json:"program_name"`
	ProgramCode string             `json:"program_code"`
	TotalIntake int                `json:"total_intake"`
	Filled      int                `json:"filled"`
	Remaining   int                `json:"remaining"`
	Quotas      []QuotaStat        `json:"quotas"`
}

// ─── Paginated Response ─────────────────────────

type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PerPage    int         `json:"per_page"`
	TotalPages int         `json:"total_pages"`
}

// ─── API Response ───────────────────────────────

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

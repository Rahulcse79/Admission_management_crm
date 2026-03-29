package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AdmissionService struct {
	repos *repository.Repositories
}

func NewAdmissionService(repos *repository.Repositories) *AdmissionService {
	return &AdmissionService{repos: repos}
}

// AllocateSeat allocates a seat to an applicant with quota validation
// KEY RULES:
// - No seat allocation if quota full
// - Real-time seat counter per quota
// - Block allocation if quota full
func (s *AdmissionService) AllocateSeat(ctx context.Context, applicantID string) (*models.Admission, error) {
	appID, err := primitive.ObjectIDFromHex(applicantID)
	if err != nil {
		return nil, errors.New("invalid applicant ID")
	}

	// Get applicant
	applicant, err := s.repos.Applicant.FindByID(ctx, appID)
	if err != nil {
		return nil, errors.New("applicant not found")
	}

	// Check if already has an admission
	existing, _ := s.repos.Admission.FindByApplicant(ctx, appID)
	if existing != nil {
		return nil, errors.New("seat already allocated to this applicant")
	}

	// Get seat matrix for this program
	sm, err := s.repos.SeatMatrix.FindByProgramAndYear(ctx, applicant.ProgramID, applicant.AcademicYearID)
	if err != nil {
		return nil, errors.New("seat matrix not configured for this program")
	}

	// ──── CRITICAL: Check quota availability ────
	var quotaFound bool
	for _, q := range sm.Quotas {
		if q.QuotaType == applicant.QuotaType {
			quotaFound = true
			if q.RemainingSeats <= 0 {
				return nil, fmt.Errorf("no seats available in %s quota (filled: %d/%d)",
					applicant.QuotaType, q.FilledSeats, q.TotalSeats)
			}
			break
		}
	}

	if !quotaFound {
		return nil, fmt.Errorf("quota type %s not configured for this program", applicant.QuotaType)
	}

	// ──── Allocate seat ────
	// Increment filled seats in seat matrix
	if err := s.repos.SeatMatrix.IncrementQuotaFilled(ctx, sm.ID, applicant.QuotaType); err != nil {
		return nil, errors.New("failed to update seat counter")
	}

	// Create admission record
	admission := &models.Admission{
		ID:             primitive.NewObjectID(),
		ApplicantID:    appID,
		ProgramID:      applicant.ProgramID,
		AcademicYearID: applicant.AcademicYearID,
		QuotaType:      applicant.QuotaType,
		EntryType:      applicant.EntryType,
		AdmissionMode:  applicant.AdmissionMode,
		FeeStatus:      models.FeeStatusPending,
		IsConfirmed:    false,
	}

	if err := s.repos.Admission.Create(ctx, admission); err != nil {
		// Rollback seat counter on failure
		_ = s.repos.SeatMatrix.DecrementQuotaFilled(ctx, sm.ID, applicant.QuotaType)
		return nil, errors.New("failed to create admission record")
	}

	// Update applicant status
	_ = s.repos.Applicant.UpdateStatus(ctx, appID, "SeatAllocated")

	return admission, nil
}

// ConfirmAdmission confirms an admission and generates an admission number
// KEY RULES:
// - Admission confirmed only if fee paid
// - Admission number generated only once
// - Admission number is unique and immutable
// Format: INST/2026/UG/CSE/KCET/0001
func (s *AdmissionService) ConfirmAdmission(ctx context.Context, admissionID string) (*models.Admission, error) {
	admID, err := primitive.ObjectIDFromHex(admissionID)
	if err != nil {
		return nil, errors.New("invalid admission ID")
	}

	admission, err := s.repos.Admission.FindByID(ctx, admID)
	if err != nil {
		return nil, errors.New("admission not found")
	}

	if admission.IsConfirmed {
		return nil, errors.New("admission already confirmed")
	}

	// ──── CRITICAL: Fee must be paid ────
	if admission.FeeStatus != models.FeeStatusPaid {
		return nil, errors.New("admission can only be confirmed after fee is paid")
	}

	// Get program details for admission number
	program, err := s.repos.Program.FindByID(ctx, admission.ProgramID)
	if err != nil {
		return nil, errors.New("program not found")
	}

	// Get institution code (walk up the hierarchy)
	dept, _ := s.repos.Department.FindByID(ctx, program.DepartmentID)
	instCode := "INST"
	if dept != nil {
		campus, _ := s.repos.Campus.FindByID(ctx, dept.CampusID)
		if campus != nil {
			inst, _ := s.repos.Institution.FindByID(ctx, campus.InstitutionID)
			if inst != nil {
				instCode = inst.Code
			}
		}
	}

	// Get sequence number
	seq, err := s.repos.Admission.GetNextSequence(ctx, admission.ProgramID, admission.QuotaType)
	if err != nil {
		return nil, errors.New("failed to generate admission number")
	}

	// Generate admission number: INST/2026/UG/CSE/KCET/0001
	admissionNumber := fmt.Sprintf("%s/%d/%s/%s/%s/%04d",
		instCode,
		time.Now().Year(),
		program.CourseType,
		program.Code,
		admission.QuotaType,
		seq,
	)

	// Confirm admission
	if err := s.repos.Admission.ConfirmAdmission(ctx, admID, admissionNumber); err != nil {
		return nil, errors.New("failed to confirm admission")
	}

	// Update applicant status
	_ = s.repos.Applicant.UpdateStatus(ctx, admission.ApplicantID, "Admitted")

	// Refresh admission data
	admission, _ = s.repos.Admission.FindByID(ctx, admID)
	return admission, nil
}

// UpdateFeeStatus updates the fee status of an admission
func (s *AdmissionService) UpdateFeeStatus(ctx context.Context, admissionID string, feeStatus models.FeeStatus) error {
	admID, err := primitive.ObjectIDFromHex(admissionID)
	if err != nil {
		return errors.New("invalid admission ID")
	}

	// Also update applicant fee status
	admission, err := s.repos.Admission.FindByID(ctx, admID)
	if err != nil {
		return err
	}

	if err := s.repos.Admission.UpdateFeeStatus(ctx, admID, feeStatus); err != nil {
		return err
	}

	return s.repos.Applicant.UpdateFeeStatus(ctx, admission.ApplicantID, feeStatus)
}

// GetAllAdmissions returns all admissions
func (s *AdmissionService) GetAllAdmissions(ctx context.Context) ([]models.Admission, error) {
	admissions, err := s.repos.Admission.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	for i := range admissions {
		app, err := s.repos.Applicant.FindByID(ctx, admissions[i].ApplicantID)
		if err == nil {
			admissions[i].ApplicantName = app.FirstName + " " + app.LastName
		}
		prog, err := s.repos.Program.FindByID(ctx, admissions[i].ProgramID)
		if err == nil {
			admissions[i].ProgramName = prog.Name
			admissions[i].ProgramCode = prog.Code
		}
		ay, err := s.repos.AcademicYear.FindByID(ctx, admissions[i].AcademicYearID)
		if err == nil {
			admissions[i].AcademicYear = ay.Year
		}
	}

	return admissions, nil
}

// GetAdmission returns a single admission by ID
func (s *AdmissionService) GetAdmission(ctx context.Context, id string) (*models.Admission, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return s.repos.Admission.FindByID(ctx, objID)
}

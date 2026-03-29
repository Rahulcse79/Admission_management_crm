package services

import (
	"context"
	"fmt"
	"time"

	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ApplicantService struct {
	repos *repository.Repositories
}

func NewApplicantService(repos *repository.Repositories) *ApplicantService {
	return &ApplicantService{repos: repos}
}

// CreateApplicant creates a new applicant with auto-generated application number
func (s *ApplicantService) CreateApplicant(ctx context.Context, req models.ApplicantRequest) (*models.Applicant, error) {
	programID, err := primitive.ObjectIDFromHex(req.ProgramID)
	if err != nil {
		return nil, fmt.Errorf("invalid program ID")
	}

	// Get current academic year
	var academicYearID primitive.ObjectID
	if req.AcademicYearID != "" {
		academicYearID, err = primitive.ObjectIDFromHex(req.AcademicYearID)
		if err != nil {
			return nil, fmt.Errorf("invalid academic year ID")
		}
	} else {
		ay, err := s.repos.AcademicYear.FindCurrent(ctx)
		if err != nil {
			return nil, fmt.Errorf("no current academic year set")
		}
		academicYearID = ay.ID
	}

	// Generate application number
	seq, err := s.repos.Applicant.GetNextApplicationNumber(ctx)
	if err != nil {
		return nil, err
	}
	applicationNumber := fmt.Sprintf("APP/%d/%04d", time.Now().Year(), seq)

	// Parse date of birth
	var dob time.Time
	if req.DateOfBirth != "" {
		dob, _ = time.Parse("2006-01-02", req.DateOfBirth)
	}

	// Default document checklist
	documents := []models.Document{
		{Name: "10th Marksheet", Status: models.DocStatusPending},
		{Name: "12th Marksheet", Status: models.DocStatusPending},
		{Name: "Transfer Certificate", Status: models.DocStatusPending},
		{Name: "Migration Certificate", Status: models.DocStatusPending},
		{Name: "Category Certificate", Status: models.DocStatusPending},
		{Name: "ID Proof", Status: models.DocStatusPending},
		{Name: "Photo", Status: models.DocStatusPending},
	}

	applicant := &models.Applicant{
		ID:                primitive.NewObjectID(),
		ApplicationNumber: applicationNumber,
		FirstName:         req.FirstName,
		LastName:          req.LastName,
		Email:             req.Email,
		Phone:             req.Phone,
		DateOfBirth:       dob,
		Gender:            req.Gender,
		Category:          req.Category,
		Address:           req.Address,
		ProgramID:         programID,
		AcademicYearID:    academicYearID,
		EntryType:         req.EntryType,
		QuotaType:         req.QuotaType,
		AdmissionMode:     req.AdmissionMode,
		AllotmentNumber:   req.AllotmentNumber,
		QualifyingExam:    req.QualifyingExam,
		Marks:             req.Marks,
		Rank:              req.Rank,
		Documents:         documents,
		FeeStatus:         models.FeeStatusPending,
		Status:            "Applied",
	}

	if err := s.repos.Applicant.Create(ctx, applicant); err != nil {
		return nil, err
	}

	return applicant, nil
}

// GetAllApplicants returns paginated applicants
func (s *ApplicantService) GetAllApplicants(ctx context.Context, page, perPage int) (*models.PaginatedResponse, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	applicants, total, err := s.repos.Applicant.FindAll(ctx, page, perPage)
	if err != nil {
		return nil, err
	}

	// Populate program names
	for i := range applicants {
		prog, err := s.repos.Program.FindByID(ctx, applicants[i].ProgramID)
		if err == nil {
			applicants[i].ProgramName = prog.Name
		}
		ay, err := s.repos.AcademicYear.FindByID(ctx, applicants[i].AcademicYearID)
		if err == nil {
			applicants[i].AcademicYear = ay.Year
		}
	}

	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	return &models.PaginatedResponse{
		Data:       applicants,
		Total:      total,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages,
	}, nil
}

// GetApplicant returns a single applicant by ID
func (s *ApplicantService) GetApplicant(ctx context.Context, id string) (*models.Applicant, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	app, err := s.repos.Applicant.FindByID(ctx, objID)
	if err != nil {
		return nil, err
	}

	prog, err := s.repos.Program.FindByID(ctx, app.ProgramID)
	if err == nil {
		app.ProgramName = prog.Name
	}

	return app, nil
}

// UpdateDocuments updates document checklist for an applicant
func (s *ApplicantService) UpdateDocuments(ctx context.Context, id string, docs []models.Document) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Applicant.UpdateDocuments(ctx, objID, docs)
}

// UpdateFeeStatus updates the fee status of an applicant
func (s *ApplicantService) UpdateFeeStatus(ctx context.Context, id string, feeStatus models.FeeStatus) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Applicant.UpdateFeeStatus(ctx, objID, feeStatus)
}

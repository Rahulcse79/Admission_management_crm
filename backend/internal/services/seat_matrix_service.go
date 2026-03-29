package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SeatMatrixService struct {
	repos *repository.Repositories
}

func NewSeatMatrixService(repos *repository.Repositories) *SeatMatrixService {
	return &SeatMatrixService{repos: repos}
}

// CreateSeatMatrix creates a seat matrix for a program in an academic year
// KEY RULE: Total base quota must equal intake
func (s *SeatMatrixService) CreateSeatMatrix(ctx context.Context, req models.SeatMatrixRequest) (*models.SeatMatrix, error) {
	programID, err := primitive.ObjectIDFromHex(req.ProgramID)
	if err != nil {
		return nil, errors.New("invalid program ID")
	}

	yearID, err := primitive.ObjectIDFromHex(req.AcademicYearID)
	if err != nil {
		return nil, errors.New("invalid academic year ID")
	}

	// Check if seat matrix already exists for this program + year
	existing, _ := s.repos.SeatMatrix.FindByProgramAndYear(ctx, programID, yearID)
	if existing != nil {
		return nil, errors.New("seat matrix already exists for this program and academic year")
	}

	// Validate: total quota seats must equal intake
	totalQuotaSeats := 0
	for _, q := range req.Quotas {
		totalQuotaSeats += q.TotalSeats
	}

	if totalQuotaSeats != req.TotalIntake {
		return nil, fmt.Errorf("quota total (%d) must equal intake (%d)", totalQuotaSeats, req.TotalIntake)
	}

	// Initialize remaining seats
	quotas := make([]models.QuotaAllocation, len(req.Quotas))
	for i, q := range req.Quotas {
		quotas[i] = models.QuotaAllocation{
			QuotaType:      q.QuotaType,
			TotalSeats:     q.TotalSeats,
			FilledSeats:    0,
			RemainingSeats: q.TotalSeats,
		}
	}

	sm := &models.SeatMatrix{
		ID:             primitive.NewObjectID(),
		ProgramID:      programID,
		AcademicYearID: yearID,
		TotalIntake:    req.TotalIntake,
		Quotas:         quotas,
		Supernumerary:  req.Supernumerary,
		TotalFilled:    0,
		TotalRemaining: req.TotalIntake,
	}

	if err := s.repos.SeatMatrix.Create(ctx, sm); err != nil {
		return nil, err
	}

	return sm, nil
}

// GetAllSeatMatrices returns all seat matrices with populated names
func (s *SeatMatrixService) GetAllSeatMatrices(ctx context.Context) ([]models.SeatMatrix, error) {
	matrices, err := s.repos.SeatMatrix.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	for i := range matrices {
		prog, err := s.repos.Program.FindByID(ctx, matrices[i].ProgramID)
		if err == nil {
			matrices[i].ProgramName = prog.Name
		}
		ay, err := s.repos.AcademicYear.FindByID(ctx, matrices[i].AcademicYearID)
		if err == nil {
			matrices[i].AcademicYear = ay.Year
		}
	}

	return matrices, nil
}

// GetSeatMatrix returns a specific seat matrix
func (s *SeatMatrixService) GetSeatMatrix(ctx context.Context, id string) (*models.SeatMatrix, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	sm, err := s.repos.SeatMatrix.FindByID(ctx, objID)
	if err != nil {
		return nil, err
	}

	prog, err := s.repos.Program.FindByID(ctx, sm.ProgramID)
	if err == nil {
		sm.ProgramName = prog.Name
	}
	ay, err := s.repos.AcademicYear.FindByID(ctx, sm.AcademicYearID)
	if err == nil {
		sm.AcademicYear = ay.Year
	}

	return sm, nil
}

// GetSeatAvailability checks seat availability for a program's quota
func (s *SeatMatrixService) GetSeatAvailability(ctx context.Context, programID string, yearID string, quotaType models.QuotaType) (*models.QuotaAllocation, error) {
	pID, err := primitive.ObjectIDFromHex(programID)
	if err != nil {
		return nil, err
	}
	yID, err := primitive.ObjectIDFromHex(yearID)
	if err != nil {
		return nil, err
	}

	sm, err := s.repos.SeatMatrix.FindByProgramAndYear(ctx, pID, yID)
	if err != nil {
		return nil, errors.New("seat matrix not found for this program")
	}

	for _, q := range sm.Quotas {
		if q.QuotaType == quotaType {
			return &q, nil
		}
	}

	return nil, fmt.Errorf("quota type %s not found in seat matrix", quotaType)
}

// UpdateSeatMatrix updates a seat matrix
func (s *SeatMatrixService) UpdateSeatMatrix(ctx context.Context, id string, req models.SeatMatrixRequest) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	// Validate total quota = intake
	totalQuotaSeats := 0
	for _, q := range req.Quotas {
		totalQuotaSeats += q.TotalSeats
	}
	if totalQuotaSeats != req.TotalIntake {
		return fmt.Errorf("quota total (%d) must equal intake (%d)", totalQuotaSeats, req.TotalIntake)
	}

	sm, err := s.repos.SeatMatrix.FindByID(ctx, objID)
	if err != nil {
		return err
	}

	sm.TotalIntake = req.TotalIntake
	sm.Quotas = req.Quotas
	sm.Supernumerary = req.Supernumerary

	// Recalculate totals
	totalFilled := 0
	for _, q := range sm.Quotas {
		totalFilled += q.FilledSeats
	}
	sm.TotalFilled = totalFilled
	sm.TotalRemaining = sm.TotalIntake - totalFilled

	return s.repos.SeatMatrix.Update(ctx, objID, sm)
}

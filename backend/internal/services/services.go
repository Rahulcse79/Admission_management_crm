package services

import (
	"github.com/rahulsingh/admission-crm-backend/internal/config"
	"github.com/rahulsingh/admission-crm-backend/internal/repository"
)

// Services holds all service instances
type Services struct {
	Auth       *AuthService
	Master     *MasterService
	SeatMatrix *SeatMatrixService
	Applicant  *ApplicantService
	Admission  *AdmissionService
	Dashboard  *DashboardService
}

// NewServices initializes all services
func NewServices(repos *repository.Repositories, cfg *config.Config) *Services {
	authSvc := NewAuthService(repos.User, cfg)
	masterSvc := NewMasterService(repos)
	seatMatrixSvc := NewSeatMatrixService(repos)
	applicantSvc := NewApplicantService(repos)
	admissionSvc := NewAdmissionService(repos)
	dashboardSvc := NewDashboardService(repos)

	return &Services{
		Auth:       authSvc,
		Master:     masterSvc,
		SeatMatrix: seatMatrixSvc,
		Applicant:  applicantSvc,
		Admission:  admissionSvc,
		Dashboard:  dashboardSvc,
	}
}

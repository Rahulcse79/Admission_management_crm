package handlers

import "github.com/rahulsingh/admission-crm-backend/internal/services"

// Handlers holds all handler instances
type Handlers struct {
	Auth       *AuthHandler
	Master     *MasterHandler
	SeatMatrix *SeatMatrixHandler
	Applicant  *ApplicantHandler
	Admission  *AdmissionHandler
	Dashboard  *DashboardHandler
}

// NewHandlers initializes all handlers
func NewHandlers(svcs *services.Services) *Handlers {
	return &Handlers{
		Auth:       NewAuthHandler(svcs.Auth),
		Master:     NewMasterHandler(svcs.Master),
		SeatMatrix: NewSeatMatrixHandler(svcs.SeatMatrix),
		Applicant:  NewApplicantHandler(svcs.Applicant),
		Admission:  NewAdmissionHandler(svcs.Admission),
		Dashboard:  NewDashboardHandler(svcs.Dashboard),
	}
}

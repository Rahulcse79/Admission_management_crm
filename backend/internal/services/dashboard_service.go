package services

import (
	"context"

	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/repository"
)

type DashboardService struct {
	repos *repository.Repositories
}

func NewDashboardService(repos *repository.Repositories) *DashboardService {
	return &DashboardService{repos: repos}
}

// GetDashboardStats returns comprehensive dashboard statistics
func (s *DashboardService) GetDashboardStats(ctx context.Context) (*models.DashboardStats, error) {
	// Get current academic year
	currentAY, err := s.repos.AcademicYear.FindCurrent(ctx)
	if err != nil {
		// If no current year, return empty stats
		return &models.DashboardStats{}, nil
	}

	// Get all seat matrices for current year
	matrices, err := s.repos.SeatMatrix.FindByAcademicYear(ctx, currentAY.ID)
	if err != nil {
		return nil, err
	}

	stats := &models.DashboardStats{}

	// Aggregate quota-wise stats
	quotaMap := make(map[models.QuotaType]*models.QuotaStat)

	for _, sm := range matrices {
		stats.TotalIntake += sm.TotalIntake
		stats.TotalAdmitted += sm.TotalFilled
		stats.TotalRemaining += sm.TotalRemaining

		// Program-wise stats
		prog, _ := s.repos.Program.FindByID(ctx, sm.ProgramID)
		programName := "Unknown"
		programCode := "UNK"
		if prog != nil {
			programName = prog.Name
			programCode = prog.Code
		}

		progStat := models.ProgramStat{
			ProgramID:   sm.ProgramID,
			ProgramName: programName,
			ProgramCode: programCode,
			TotalIntake: sm.TotalIntake,
			Filled:      sm.TotalFilled,
			Remaining:   sm.TotalRemaining,
		}

		for _, q := range sm.Quotas {
			progStat.Quotas = append(progStat.Quotas, models.QuotaStat{
				QuotaType:      q.QuotaType,
				TotalSeats:     q.TotalSeats,
				FilledSeats:    q.FilledSeats,
				RemainingSeats: q.RemainingSeats,
			})

			// Aggregate to overall quota stats
			if _, ok := quotaMap[q.QuotaType]; !ok {
				quotaMap[q.QuotaType] = &models.QuotaStat{
					QuotaType: q.QuotaType,
				}
			}
			quotaMap[q.QuotaType].TotalSeats += q.TotalSeats
			quotaMap[q.QuotaType].FilledSeats += q.FilledSeats
			quotaMap[q.QuotaType].RemainingSeats += q.RemainingSeats
		}

		stats.ProgramWiseStats = append(stats.ProgramWiseStats, progStat)
	}

	for _, qs := range quotaMap {
		stats.QuotaWiseStats = append(stats.QuotaWiseStats, *qs)
	}

	// Pending counts
	pendingDocs, _ := s.repos.Applicant.CountPendingDocuments(ctx)
	pendingFees, _ := s.repos.Applicant.CountPendingFees(ctx)
	pendingApps, _ := s.repos.Applicant.CountByStatus(ctx, "Applied")

	stats.PendingDocuments = int(pendingDocs)
	stats.PendingFees = int(pendingFees)
	stats.TotalPending = int(pendingApps)

	// Recent admissions
	recent, _ := s.repos.Admission.FindRecent(ctx, 10)
	if recent != nil {
		for i := range recent {
			app, err := s.repos.Applicant.FindByID(ctx, recent[i].ApplicantID)
			if err == nil {
				recent[i].ApplicantName = app.FirstName + " " + app.LastName
			}
			prog, err := s.repos.Program.FindByID(ctx, recent[i].ProgramID)
			if err == nil {
				recent[i].ProgramName = prog.Name
				recent[i].ProgramCode = prog.Code
			}
		}
		stats.RecentAdmissions = recent
	}

	return stats, nil
}

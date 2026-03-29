package router

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rahulsingh/admission-crm-backend/internal/config"
	"github.com/rahulsingh/admission-crm-backend/internal/handlers"
	"github.com/rahulsingh/admission-crm-backend/internal/middleware"
	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/services"
)

// Setup configures and returns the Gin router
func Setup(h *handlers.Handlers, authSvc *services.AuthService, cfg *config.Config) *gin.Engine {
	gin.SetMode(cfg.GinMode)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())

	// CORS
	rawOrigins := strings.Split(cfg.CORSOrigins, ",")
	var origins []string
	for _, o := range rawOrigins {
		trimmed := strings.TrimSpace(o)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	log.Printf("🌐 CORS allowed origins: %v", origins)

	r.Use(cors.New(cors.Config{
		AllowOrigins: origins,
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Origin", "Content-Type", "Accept", "Authorization",
			"X-Requested-With", "X-Request-Timestamp", "X-Request-Nonce",
			"X-Request-Fingerprint", "X-Content-Type-Options",
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           86400,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "admission-crm-api"})
	})

	// API v1
	v1 := r.Group("/api/v1")
	{
		// ─── Public Routes ──────────────────────
		auth := v1.Group("/auth")
		{
			auth.POST("/login", h.Auth.Login)
		}

		// ─── Protected Routes ───────────────────
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(authSvc))
		{
			// Auth
			protected.GET("/auth/me", h.Auth.Me)
			protected.POST("/auth/register",
				middleware.RoleMiddleware(models.RoleAdmin),
				h.Auth.Register,
			)
			protected.GET("/auth/users",
				middleware.RoleMiddleware(models.RoleAdmin),
				h.Auth.GetUsers,
			)

			// ─── Master Setup (Admin Only) ──────
			admin := protected.Group("")
			admin.Use(middleware.RoleMiddleware(models.RoleAdmin))
			{
				// Institutions
				admin.POST("/institutions", h.Master.CreateInstitution)
				admin.PUT("/institutions/:id", h.Master.UpdateInstitution)
				admin.DELETE("/institutions/:id", h.Master.DeleteInstitution)

				// Campuses
				admin.POST("/campuses", h.Master.CreateCampus)
				admin.PUT("/campuses/:id", h.Master.UpdateCampus)
				admin.DELETE("/campuses/:id", h.Master.DeleteCampus)

				// Departments
				admin.POST("/departments", h.Master.CreateDepartment)
				admin.PUT("/departments/:id", h.Master.UpdateDepartment)
				admin.DELETE("/departments/:id", h.Master.DeleteDepartment)

				// Programs
				admin.POST("/programs", h.Master.CreateProgram)
				admin.PUT("/programs/:id", h.Master.UpdateProgram)
				admin.DELETE("/programs/:id", h.Master.DeleteProgram)

				// Academic Years
				admin.POST("/academic-years", h.Master.CreateAcademicYear)
				admin.PUT("/academic-years/:id", h.Master.UpdateAcademicYear)
				admin.PUT("/academic-years/:id/set-current", h.Master.SetCurrentAcademicYear)

				// Seat Matrix
				admin.POST("/seat-matrices", h.SeatMatrix.Create)
				admin.PUT("/seat-matrices/:id", h.SeatMatrix.Update)
			}

			// ─── Read Routes (All authenticated) ─
			protected.GET("/institutions", h.Master.GetInstitutions)
			protected.GET("/institutions/:id", h.Master.GetInstitution)
			protected.GET("/campuses", h.Master.GetCampuses)
			protected.GET("/campuses/:id", h.Master.GetCampus)
			protected.GET("/departments", h.Master.GetDepartments)
			protected.GET("/departments/:id", h.Master.GetDepartment)
			protected.GET("/programs", h.Master.GetPrograms)
			protected.GET("/programs/:id", h.Master.GetProgram)
			protected.GET("/academic-years", h.Master.GetAcademicYears)
			protected.GET("/academic-years/current", h.Master.GetCurrentAcademicYear)
			protected.GET("/seat-matrices", h.SeatMatrix.GetAll)
			protected.GET("/seat-matrices/:id", h.SeatMatrix.GetOne)
			protected.GET("/seat-matrices/availability", h.SeatMatrix.CheckAvailability)

			// ─── Admission Officer Routes ────────
			officer := protected.Group("")
			officer.Use(middleware.RoleMiddleware(models.RoleAdmin, models.RoleAdmissionOfficer))
			{
				// Applicants
				officer.POST("/applicants", h.Applicant.Create)
				officer.PUT("/applicants/:id/documents", h.Applicant.UpdateDocuments)
				officer.PUT("/applicants/:id/fee-status", h.Applicant.UpdateFeeStatus)

				// Admissions
				officer.POST("/admissions/allocate", h.Admission.AllocateSeat)
				officer.PUT("/admissions/:id/confirm", h.Admission.ConfirmAdmission)
				officer.PUT("/admissions/:id/fee-status", h.Admission.UpdateFeeStatus)
			}

			// All authenticated users can view
			protected.GET("/applicants", h.Applicant.GetAll)
			protected.GET("/applicants/:id", h.Applicant.GetOne)
			protected.GET("/admissions", h.Admission.GetAll)
			protected.GET("/admissions/:id", h.Admission.GetOne)

			// Dashboard
			protected.GET("/dashboard", h.Dashboard.GetStats)
		}
	}

	return r
}

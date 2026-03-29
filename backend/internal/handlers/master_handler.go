package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/services"
)

type MasterHandler struct {
	service *services.MasterService
}

func NewMasterHandler(service *services.MasterService) *MasterHandler {
	return &MasterHandler{service: service}
}

// ─── Institution Handlers ───────────────────────

func (h *MasterHandler) CreateInstitution(c *gin.Context) {
	var inst models.Institution
	if err := c.ShouldBindJSON(&inst); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.CreateInstitution(c.Request.Context(), &inst); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: inst, Message: "Institution created"})
}

func (h *MasterHandler) GetInstitutions(c *gin.Context) {
	items, err := h.service.GetAllInstitutions(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func (h *MasterHandler) GetInstitution(c *gin.Context) {
	item, err := h.service.GetInstitution(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Institution not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: item})
}

func (h *MasterHandler) UpdateInstitution(c *gin.Context) {
	var inst models.Institution
	if err := c.ShouldBindJSON(&inst); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.UpdateInstitution(c.Request.Context(), c.Param("id"), &inst); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Institution updated"})
}

func (h *MasterHandler) DeleteInstitution(c *gin.Context) {
	if err := h.service.DeleteInstitution(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Institution deleted"})
}

// ─── Campus Handlers ────────────────────────────

func (h *MasterHandler) CreateCampus(c *gin.Context) {
	var campus models.Campus
	if err := c.ShouldBindJSON(&campus); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.CreateCampus(c.Request.Context(), &campus); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: campus, Message: "Campus created"})
}

func (h *MasterHandler) GetCampuses(c *gin.Context) {
	instID := c.Query("institution_id")
	if instID != "" {
		items, err := h.service.GetCampusesByInstitution(c.Request.Context(), instID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
			return
		}
		c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
		return
	}

	items, err := h.service.GetAllCampuses(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func (h *MasterHandler) GetCampus(c *gin.Context) {
	item, err := h.service.GetCampus(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Campus not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: item})
}

func (h *MasterHandler) UpdateCampus(c *gin.Context) {
	var campus models.Campus
	if err := c.ShouldBindJSON(&campus); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.UpdateCampus(c.Request.Context(), c.Param("id"), &campus); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Campus updated"})
}

func (h *MasterHandler) DeleteCampus(c *gin.Context) {
	if err := h.service.DeleteCampus(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Campus deleted"})
}

// ─── Department Handlers ────────────────────────

func (h *MasterHandler) CreateDepartment(c *gin.Context) {
	var dept models.Department
	if err := c.ShouldBindJSON(&dept); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.CreateDepartment(c.Request.Context(), &dept); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: dept, Message: "Department created"})
}

func (h *MasterHandler) GetDepartments(c *gin.Context) {
	campusID := c.Query("campus_id")
	if campusID != "" {
		items, err := h.service.GetDepartmentsByCampus(c.Request.Context(), campusID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
			return
		}
		c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
		return
	}

	items, err := h.service.GetAllDepartments(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func (h *MasterHandler) GetDepartment(c *gin.Context) {
	item, err := h.service.GetDepartment(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Department not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: item})
}

func (h *MasterHandler) UpdateDepartment(c *gin.Context) {
	var dept models.Department
	if err := c.ShouldBindJSON(&dept); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.UpdateDepartment(c.Request.Context(), c.Param("id"), &dept); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Department updated"})
}

func (h *MasterHandler) DeleteDepartment(c *gin.Context) {
	if err := h.service.DeleteDepartment(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Department deleted"})
}

// ─── Program Handlers ───────────────────────────

func (h *MasterHandler) CreateProgram(c *gin.Context) {
	var prog models.Program
	if err := c.ShouldBindJSON(&prog); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.CreateProgram(c.Request.Context(), &prog); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: prog, Message: "Program created"})
}

func (h *MasterHandler) GetPrograms(c *gin.Context) {
	deptID := c.Query("department_id")
	if deptID != "" {
		items, err := h.service.GetProgramsByDepartment(c.Request.Context(), deptID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
			return
		}
		c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
		return
	}

	items, err := h.service.GetAllPrograms(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func (h *MasterHandler) GetProgram(c *gin.Context) {
	item, err := h.service.GetProgram(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Program not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: item})
}

func (h *MasterHandler) UpdateProgram(c *gin.Context) {
	var prog models.Program
	if err := c.ShouldBindJSON(&prog); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.UpdateProgram(c.Request.Context(), c.Param("id"), &prog); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Program updated"})
}

func (h *MasterHandler) DeleteProgram(c *gin.Context) {
	if err := h.service.DeleteProgram(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Program deleted"})
}

// ─── Academic Year Handlers ─────────────────────

func (h *MasterHandler) CreateAcademicYear(c *gin.Context) {
	var ay models.AcademicYear
	if err := c.ShouldBindJSON(&ay); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.CreateAcademicYear(c.Request.Context(), &ay); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: ay, Message: "Academic year created"})
}

func (h *MasterHandler) GetAcademicYears(c *gin.Context) {
	items, err := h.service.GetAllAcademicYears(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func (h *MasterHandler) GetCurrentAcademicYear(c *gin.Context) {
	item, err := h.service.GetCurrentAcademicYear(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "No current academic year set"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: item})
}

func (h *MasterHandler) UpdateAcademicYear(c *gin.Context) {
	var ay models.AcademicYear
	if err := c.ShouldBindJSON(&ay); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	if err := h.service.UpdateAcademicYear(c.Request.Context(), c.Param("id"), &ay); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Academic year updated"})
}

func (h *MasterHandler) SetCurrentAcademicYear(c *gin.Context) {
	if err := h.service.SetCurrentAcademicYear(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Current academic year updated"})
}

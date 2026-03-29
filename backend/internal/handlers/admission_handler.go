package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/services"
)

type AdmissionHandler struct {
	service *services.AdmissionService
}

func NewAdmissionHandler(service *services.AdmissionService) *AdmissionHandler {
	return &AdmissionHandler{service: service}
}

// AllocateSeat handles seat allocation with quota validation
func (h *AdmissionHandler) AllocateSeat(c *gin.Context) {
	var req models.AllocateSeatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	admission, err := h.service.AllocateSeat(c.Request.Context(), req.ApplicantID)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data:    admission,
		Message: "Seat allocated successfully",
	})
}

// ConfirmAdmission confirms an admission and generates admission number
func (h *AdmissionHandler) ConfirmAdmission(c *gin.Context) {
	admission, err := h.service.ConfirmAdmission(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    admission,
		Message: "Admission confirmed. Number: " + admission.AdmissionNumber,
	})
}

// UpdateFeeStatus updates fee status for an admission
func (h *AdmissionHandler) UpdateFeeStatus(c *gin.Context) {
	var req models.UpdateFeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	if err := h.service.UpdateFeeStatus(c.Request.Context(), c.Param("id"), req.FeeStatus); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Fee status updated"})
}

// GetAll returns all admissions
func (h *AdmissionHandler) GetAll(c *gin.Context) {
	items, err := h.service.GetAllAdmissions(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

// GetOne returns a single admission
func (h *AdmissionHandler) GetOne(c *gin.Context) {
	item, err := h.service.GetAdmission(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Admission not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: item})
}

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/services"
)

type SeatMatrixHandler struct {
	service *services.SeatMatrixService
}

func NewSeatMatrixHandler(service *services.SeatMatrixService) *SeatMatrixHandler {
	return &SeatMatrixHandler{service: service}
}

func (h *SeatMatrixHandler) Create(c *gin.Context) {
	var req models.SeatMatrixRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	sm, err := h.service.CreateSeatMatrix(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: sm, Message: "Seat matrix created"})
}

func (h *SeatMatrixHandler) GetAll(c *gin.Context) {
	items, err := h.service.GetAllSeatMatrices(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func (h *SeatMatrixHandler) GetOne(c *gin.Context) {
	item, err := h.service.GetSeatMatrix(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Seat matrix not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: item})
}

func (h *SeatMatrixHandler) Update(c *gin.Context) {
	var req models.SeatMatrixRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	if err := h.service.UpdateSeatMatrix(c.Request.Context(), c.Param("id"), req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Seat matrix updated"})
}

func (h *SeatMatrixHandler) CheckAvailability(c *gin.Context) {
	programID := c.Query("program_id")
	yearID := c.Query("academic_year_id")
	quotaType := c.Query("quota_type")

	if programID == "" || yearID == "" || quotaType == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "program_id, academic_year_id, and quota_type are required",
		})
		return
	}

	quota, err := h.service.GetSeatAvailability(c.Request.Context(), programID, yearID, models.QuotaType(quotaType))
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: quota})
}

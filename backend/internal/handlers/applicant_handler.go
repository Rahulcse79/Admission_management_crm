package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/services"
)

type ApplicantHandler struct {
	service *services.ApplicantService
}

func NewApplicantHandler(service *services.ApplicantService) *ApplicantHandler {
	return &ApplicantHandler{service: service}
}

func (h *ApplicantHandler) Create(c *gin.Context) {
	var req models.ApplicantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	app, err := h.service.CreateApplicant(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: app, Message: "Applicant created"})
}

func (h *ApplicantHandler) GetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	result, err := h.service.GetAllApplicants(c.Request.Context(), page, perPage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: result})
}

func (h *ApplicantHandler) GetOne(c *gin.Context) {
	app, err := h.service.GetApplicant(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Applicant not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: app})
}

func (h *ApplicantHandler) UpdateDocuments(c *gin.Context) {
	var docs []models.Document
	if err := c.ShouldBindJSON(&docs); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	if err := h.service.UpdateDocuments(c.Request.Context(), c.Param("id"), docs); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Documents updated"})
}

func (h *ApplicantHandler) UpdateFeeStatus(c *gin.Context) {
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

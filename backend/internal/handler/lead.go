package handler

import (
	"net/http"
	"strconv"

	"imagine_backend/internal/dto"
	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
)

// CreateLead is PUBLIC — this is where the record of who is buying gets created,
// just before the site opens the Instagram DM. It returns only an id, so the public
// can never read anyone else's leads.
func CreateLead(c *gin.Context) {
	var req dto.LeadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, "Name and Instagram username are required")
		return
	}
	res, err := services.CreateLead(req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, res)
}

func ListLeads(c *gin.Context) {
	sinceDays, _ := strconv.Atoi(c.Query("sinceDays"))
	leads, err := services.ListLeads(c.Query("status"), sinceDays)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, leads)
}

// LeadStats backs the numbers at the top of the dashboard.
func LeadStats(c *gin.Context) {
	stats, err := services.LeadStats()
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, stats)
}

func PatchLead(c *gin.Context) {
	id, ok := parseID(c, "Lead not found")
	if !ok {
		return
	}
	var patch dto.LeadPatch
	if err := c.ShouldBindJSON(&patch); err != nil {
		badRequest(c, "Invalid lead payload")
		return
	}
	res, err := services.PatchLead(id, patch)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func DeleteLead(c *gin.Context) {
	id, ok := parseID(c, "Lead not found")
	if !ok {
		return
	}
	if err := services.DeleteLead(id); err != nil {
		respondError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

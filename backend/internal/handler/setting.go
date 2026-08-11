package handler

import (
	"net/http"

	"imagine_backend/internal/dto"
	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
)

// GetSettings is PUBLIC — the storefront reads it on every load.
func GetSettings(c *gin.Context) {
	res, err := services.GetSettings()
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

// UpdateSettings replaces the whole document. A full replace rather than a deep
// merge, because the admin form always submits the complete shape — a merge would
// make deleting a nav link or a trust item impossible.
func UpdateSettings(c *gin.Context) {
	var req dto.SettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, "Settings must be an object")
		return
	}
	res, err := services.SaveSettings(req.Data)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func ResetSettings(c *gin.Context) {
	res, err := services.ResetSettings()
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

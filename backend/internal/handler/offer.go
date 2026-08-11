package handler

import (
	"net/http"

	"imagine_backend/internal/dto"
	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
)

// ListOffers is public and returns live offers only: active, unexpired, slots left.
func ListOffers(c *gin.Context) {
	offers, err := services.ListOffers(false)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, offers)
}

func ListAllOffers(c *gin.Context) {
	offers, err := services.ListOffers(true)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, offers)
}

func CreateOffer(c *gin.Context) {
	var req dto.OfferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, "Invalid offer payload")
		return
	}
	res, err := services.CreateOffer(req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, res)
}

func UpdateOffer(c *gin.Context) {
	id, ok := parseID(c, "Offer not found")
	if !ok {
		return
	}
	var req dto.OfferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, "Invalid offer payload")
		return
	}
	res, err := services.UpdateOffer(id, req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func DuplicateOffer(c *gin.Context) {
	id, ok := parseID(c, "Offer not found")
	if !ok {
		return
	}
	res, err := services.DuplicateOffer(id)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, res)
}

func DeleteOffer(c *gin.Context) {
	id, ok := parseID(c, "Offer not found")
	if !ok {
		return
	}
	if err := services.DeleteOffer(id); err != nil {
		respondError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

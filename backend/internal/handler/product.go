package handler

import (
	"net/http"

	"imagine_backend/internal/dto"
	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
)

// ListProducts is public and returns active products only.
func ListProducts(c *gin.Context) {
	products, err := services.ListProducts(false)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, products)
}

// ListAllProducts is admin-only — inactive products would otherwise be unmanageable.
func ListAllProducts(c *gin.Context) {
	products, err := services.ListProducts(true)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, products)
}

func CreateProduct(c *gin.Context) {
	var req dto.ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, "Invalid product payload")
		return
	}
	res, err := services.CreateProduct(req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, res)
}

func UpdateProduct(c *gin.Context) {
	id, ok := parseID(c, "Product not found")
	if !ok {
		return
	}
	var req dto.ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, "Invalid product payload")
		return
	}
	res, err := services.UpdateProduct(id, req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

// PatchProduct backs the inline price and visibility edits.
func PatchProduct(c *gin.Context) {
	id, ok := parseID(c, "Product not found")
	if !ok {
		return
	}
	var patch dto.ProductPatch
	if err := c.ShouldBindJSON(&patch); err != nil {
		badRequest(c, "Invalid product payload")
		return
	}
	res, err := services.PatchProduct(id, patch)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func DeleteProduct(c *gin.Context) {
	id, ok := parseID(c, "Product not found")
	if !ok {
		return
	}
	if err := services.DeleteProduct(id); err != nil {
		respondError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

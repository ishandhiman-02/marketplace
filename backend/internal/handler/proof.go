package handler

import (
	"net/http"

	"imagine_backend/internal/dto"
	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
)

// ListProofs is public and returns active proofs only.
func ListProofs(c *gin.Context) {
	proofs, err := services.ListProofs(false)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, proofs)
}

func ListAllProofs(c *gin.Context) {
	proofs, err := services.ListProofs(true)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, proofs)
}

// CreateProofs accepts several screenshots at once, already compressed client-side.
func CreateProofs(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		badRequest(c, "No file received")
		return
	}
	headers := form.File["files"]
	if len(headers) == 0 {
		badRequest(c, "No file received")
		return
	}
	if len(headers) > 12 {
		headers = headers[:12]
	}

	inputs := make([]services.FileInput, 0, len(headers))
	for _, fh := range headers {
		input, err := readFile(fh)
		if err != nil {
			respondError(c, err)
			return
		}
		inputs = append(inputs, input)
	}

	created, err := services.CreateProofs(inputs, c.PostForm("caption"), c.PostForm("productName"))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, created)
}

func PatchProof(c *gin.Context) {
	id, ok := parseID(c, "Proof not found")
	if !ok {
		return
	}
	var patch dto.ProofPatch
	if err := c.ShouldBindJSON(&patch); err != nil {
		badRequest(c, "Invalid proof payload")
		return
	}
	res, err := services.PatchProof(id, patch)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func DeleteProof(c *gin.Context) {
	id, ok := parseID(c, "Proof not found")
	if !ok {
		return
	}
	if err := services.DeleteProof(id); err != nil {
		respondError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

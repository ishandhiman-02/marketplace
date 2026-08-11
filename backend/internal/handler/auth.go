package handler

import (
	"net/http"

	"imagine_backend/internal/dto"
	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, "Both email and password are required")
		return
	}

	res, err := services.Login(req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

// Me is the frontend's session check — is this token still valid?
func Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	email, _ := c.Get("email")

	id, _ := userID.(uint)
	mail, _ := email.(string)

	c.JSON(http.StatusOK, dto.MeResponse{User: dto.UserResponse{ID: id, Email: mail}})
}

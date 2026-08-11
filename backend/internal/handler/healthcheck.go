package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthCheckResponse struct {
	Status  string    `json:"status"`
	Time    time.Time `json:"time"`
	Message string    `json:"message"`
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, HealthCheckResponse{
		Status:  "ok",
		Time:    time.Now(),
		Message: "Server is healthy",
	})
}

package apperror

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (e AppError) SendError(c *gin.Context) {
	c.JSON(e.HTTPStatus, gin.H{
		"error": e.Message,
		"code":  e.Code,
	})
}

// Send renders any error to the client.
//
// Anything that is not an AppError is an unexpected fault: it is attached to the
// context for the access log and reported as a bare 500, because an internal
// message (a driver error, a failed query) must never reach a client.
func Send(c *gin.Context, err error) {
	var appErr AppError
	if errors.As(err, &appErr) {
		appErr.SendError(c)
		return
	}

	_ = c.Error(err)
	c.JSON(http.StatusInternalServerError, gin.H{
		"error": "Server error",
		"code":  InternalServerError.Code,
	})
}

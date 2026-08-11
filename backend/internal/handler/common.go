package handler

import (
	"strconv"

	"imagine_backend/internal/apperror"

	"github.com/gin-gonic/gin"
)

// parseID reads the :id path param. It writes the 404 response itself and reports
// false, because a non-numeric id can only mean "no such record".
func parseID(c *gin.Context, notFoundMsg string) (uint, bool) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || id == 0 {
		apperror.NotFound.With(notFoundMsg).SendError(c)
		return 0, false
	}
	return uint(id), true
}

// badRequest maps a malformed JSON body to the same shape every other error uses.
func badRequest(c *gin.Context, msg string) {
	apperror.BadRequest.With(msg).SendError(c)
}

// respondError renders a service-layer error. The status travels on the error
// itself, so this needs no knowledge of which entity produced it.
func respondError(c *gin.Context, err error) {
	apperror.Send(c, err)
}

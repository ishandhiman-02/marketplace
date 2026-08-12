package handler

import (
	"net/http"
	"strconv"

	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
)

// Version reports the current content revision.
//
// Public and deliberately tiny — it is polled, and it must never become the
// expensive endpoint. It reads one integer from memory and touches no database.
//
// no-store rather than no-cache: a cached revision would defeat the whole point.
func Version(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, gin.H{"revision": strconv.FormatUint(services.Revision(), 10)})
}

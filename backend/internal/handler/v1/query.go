package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Query handles POST /api/v1/query.
// NOTE: the RAG backend is not configured in this deploy, so the route fails soft
// with 503 rather than pretending to answer.
func Query(c *gin.Context) {
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "RAG not configured"})
}

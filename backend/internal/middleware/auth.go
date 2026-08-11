package middleware

import (
	"strings"

	"imagine_backend/internal/apperror"
	"imagine_backend/internal/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			abort(c, "Authorization header is required")
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			abort(c, "Authorization header must be in the format Bearer <token>")
			return
		}

		claims, err := utils.ValidateJWT(parts[1])
		if err != nil {
			abort(c, "Invalid or expired token")
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}

// abort rejects the request through the same error shape every handler uses, so a
// 401 from here is indistinguishable in form from a 401 raised by a service.
func abort(c *gin.Context, message string) {
	apperror.ErrUnauthorized.With(message).SendError(c)
	c.Abort()
}

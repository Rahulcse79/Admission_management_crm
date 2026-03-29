package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/services"
)

// AuthMiddleware validates JWT tokens
func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Error:   "authorization header required",
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Error:   "invalid authorization format",
			})
			c.Abort()
			return
		}

		user, err := authService.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Error:   "invalid or expired token",
			})
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Set("user_id", user.ID.Hex())
		c.Set("user_role", string(user.Role))
		c.Next()
	}
}

// RoleMiddleware restricts access to specific roles
func RoleMiddleware(allowedRoles ...models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleStr, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, models.APIResponse{
				Success: false,
				Error:   "access denied",
			})
			c.Abort()
			return
		}

		userRole := models.Role(roleStr.(string))
		for _, role := range allowedRoles {
			if userRole == role {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "insufficient permissions",
		})
		c.Abort()
	}
}

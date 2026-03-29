package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger is a custom structured logger middleware
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		duration := time.Since(start)
		statusCode := c.Writer.Status()

		log.Printf("│ %d │ %13v │ %15s │ %-7s %s?%s │",
			statusCode,
			duration,
			c.ClientIP(),
			c.Request.Method,
			path,
			query,
		)
	}
}

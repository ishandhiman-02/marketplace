package server

import (
	"imagine_backend/internal/handler"
	v1 "imagine_backend/internal/handler/v1"
	"imagine_backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes mounts every API route under /api. The frontend's API base is the
// literal "/api", which the platform rewrites to "<backendURL>/api" on deploy —
// anything registered outside this group is unreachable from the browser.
func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.GET("/health", handler.HealthCheck)

		auth := api.Group("/auth")
		{
			auth.POST("/login", handler.Login)
			auth.GET("/me", middleware.AuthMiddleware(), handler.Me)
		}

		products := api.Group("/products")
		{
			products.GET("", handler.ListProducts)
			products.GET("/all", middleware.AuthMiddleware(), handler.ListAllProducts)
			products.POST("", middleware.AuthMiddleware(), handler.CreateProduct)
			products.PUT("/:id", middleware.AuthMiddleware(), handler.UpdateProduct)
			products.PATCH("/:id", middleware.AuthMiddleware(), handler.PatchProduct)
			products.DELETE("/:id", middleware.AuthMiddleware(), handler.DeleteProduct)
		}

		offers := api.Group("/offers")
		{
			offers.GET("", handler.ListOffers)
			offers.GET("/all", middleware.AuthMiddleware(), handler.ListAllOffers)
			offers.POST("", middleware.AuthMiddleware(), handler.CreateOffer)
			offers.PUT("/:id", middleware.AuthMiddleware(), handler.UpdateOffer)
			offers.POST("/:id/duplicate", middleware.AuthMiddleware(), handler.DuplicateOffer)
			offers.DELETE("/:id", middleware.AuthMiddleware(), handler.DeleteOffer)
		}

		proofs := api.Group("/proofs")
		{
			proofs.GET("", handler.ListProofs)
			proofs.GET("/all", middleware.AuthMiddleware(), handler.ListAllProofs)
			proofs.POST("", middleware.AuthMiddleware(), handler.CreateProofs)
			proofs.PATCH("/:id", middleware.AuthMiddleware(), handler.PatchProof)
			proofs.DELETE("/:id", middleware.AuthMiddleware(), handler.DeleteProof)
		}

		leads := api.Group("/leads")
		{
			// Public: the site records the buyer just before opening the DM.
			leads.POST("", handler.CreateLead)
			leads.GET("", middleware.AuthMiddleware(), handler.ListLeads)
			leads.GET("/stats", middleware.AuthMiddleware(), handler.LeadStats)
			leads.PATCH("/:id", middleware.AuthMiddleware(), handler.PatchLead)
			leads.DELETE("/:id", middleware.AuthMiddleware(), handler.DeleteLead)
		}

		settings := api.Group("/settings")
		{
			settings.GET("", handler.GetSettings)
			settings.PUT("", middleware.AuthMiddleware(), handler.UpdateSettings)
			settings.POST("/reset", middleware.AuthMiddleware(), handler.ResetSettings)
		}

		uploads := api.Group("/uploads")
		{
			uploads.POST("", middleware.AuthMiddleware(), handler.UploadFile)
			// Public read — proof screenshots and product images are shown to everyone.
			uploads.GET("/:filename", handler.ServeUpload)
		}

		// RAG proxy — consumed by imagine.bo-chat-widget.js
		v1Group := api.Group("/v1")
		{
			v1Group.GET("/kb", v1.ListKBs)
			v1Group.POST("/sessions", v1.CreateSession)
			v1Group.GET("/sessions", v1.ListSessions)
			v1Group.GET("/sessions/:id", v1.GetSessionHistory)
			v1Group.POST("/query", v1.Query)
		}
	}
}

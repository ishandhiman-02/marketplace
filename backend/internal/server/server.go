package server

import (
	"context"
	"errors"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"imagine_backend/config"
	webserver "imagine_backend/internal"
	"imagine_backend/internal/apperror"
	"imagine_backend/internal/db"
	"imagine_backend/internal/handler"
	"imagine_backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func StartServer() {
	config.LoadConfig()
	db.ConnectToDB()

	if err := runServer(createServer(), 5*time.Second); err != nil {
		log.Fatal(err)
	}
}

func createServer() *http.Server {
	r := gin.New()

	// CORS must run first so every response (including panics / aborts) carries
	// CORS headers. It also answers OPTIONS preflights itself.
	r.Use(middleware.CORSMiddleware())

	// gin.Logger already records method, path, status, latency and client IP,
	// so IPLoggingMiddleware would only log the same request a second time.
	r.Use(
		gin.Logger(),
		gin.Recovery(),
		middleware.ErrorHandlingMiddleware(),
		middleware.RateLimiterMiddleware(),
	)

	// One handler for every non-API request: static files out of the embedded
	// build, and index.html with its SEO block filled in from the saved settings.
	spa := handler.ServeSPA(distFileSystem())

	r.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/api/") {
			apperror.NotFound.With("API not found").SendError(c)
			return
		}
		spa(c)
	})

	RegisterRoutes(r)

	server := &http.Server{
		Addr:    ":" + config.AppConfig.Port,
		Handler: r,
	}

	return server
}

func runServer(server *http.Server, shutdownTimeOut time.Duration) error {
	errCh := make(chan error, 1)
	go func() {
		log.Println("Server running on :" + config.AppConfig.Port)
		if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-errCh:
		return err
	case <-stop:
		log.Printf("Received shutdown signal")
	}

	shutDownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeOut)
	defer cancel()

	if err := server.Shutdown(shutDownCtx); err != nil {
		if closeErr := server.Close(); closeErr != nil {
			return errors.Join(err, closeErr)
		}
		return err
	}

	log.Println("Server stopped gracefully")
	return nil
}

func distFileSystem() http.FileSystem {
	fsys, err := fs.Sub(webserver.DistFolder, "dist")
	if err != nil {
		panic(err)
	}
	return http.FS(fsys)
}

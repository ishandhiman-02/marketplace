package server

import (
	"context"
	"errors"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path"
	"strings"
	"syscall"
	"time"

	"imagine_backend/config"
	webserver "imagine_backend/internal"
	"imagine_backend/internal/apperror"
	"imagine_backend/internal/db"
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

	distFS := distFileSystem()

	// One handler for every non-API request. Serving static files as the general
	// rule — rather than special-casing /assets — is what makes the favicon and
	// anything else the build emits work without registering another route.
	r.NoRoute(func(c *gin.Context) {
		urlPath := c.Request.URL.Path

		if strings.HasPrefix(urlPath, "/api/") {
			apperror.NotFound.With("API not found").SendError(c)
			return
		}

		if serveEmbedded(c, distFS, strings.TrimPrefix(urlPath, "/")) {
			return
		}

		// A path that names a file but has none is a real 404. Answering it with
		// the app shell would hand the browser HTML where it asked for a script.
		if path.Ext(urlPath) != "" {
			c.Status(http.StatusNotFound)
			return
		}

		// Everything else is a client-side route.
		if !serveEmbedded(c, distFS, "index.html") {
			c.String(http.StatusInternalServerError, "index.html not found")
		}
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

// serveEmbedded writes one file out of the embedded SPA build and reports whether
// it existed, so the caller can decide what a miss means.
//
// embed.FS reports a zero modification time, so ServeContent emits no
// Last-Modified and computes no ETag — without an explicit Cache-Control the
// browser has nothing to revalidate against and re-downloads the whole bundle on
// every visit.
func serveEmbedded(c *gin.Context, fsys http.FileSystem, name string) bool {
	if name == "" {
		return false
	}

	f, err := fsys.Open(name)
	if err != nil {
		return false
	}
	defer f.Close()

	stat, err := f.Stat()
	if err != nil || stat.IsDir() {
		return false
	}

	// Vite content-hashes everything under assets/, so those URLs can never go
	// stale and are safe to cache forever. index.html must stay revalidated or a
	// returning visitor would never see a new deploy.
	if strings.HasPrefix(name, "assets/") {
		c.Header("Cache-Control", "public, max-age=31536000, immutable")
	} else {
		c.Header("Cache-Control", "no-cache")
	}

	http.ServeContent(c.Writer, c.Request, stat.Name(), stat.ModTime(), f)
	return true
}

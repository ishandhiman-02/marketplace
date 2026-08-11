package handler

import (
	"encoding/json"
	"html"
	"io"
	"net/http"
	"path"
	"strings"

	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
)

// The block in index.html that this file rewrites. Everything between the two
// markers is replaced; if either is missing the page is served untouched.
const (
	seoStart = "<!-- seo:start -->"
	seoEnd   = "<!-- seo:end -->"
)

// Fallbacks when the settings row is empty or unreadable. These mirror
// DEFAULT_SETTINGS.brand in frontend/src/config/defaults.js — the two are only
// ever read when nothing has been saved, so a small duplication is cheaper than
// shipping the whole defaults document to the backend.
const (
	defaultBrandName = "SubStore"
	defaultTagline   = "Premium subscriptions & tools"
)

// ServeSPA returns the handler for every non-API request: static files straight
// out of the embedded build, and index.html with its SEO block filled in from
// the admin's settings.
func ServeSPA(dist http.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		urlPath := c.Request.URL.Path

		if serveEmbedded(c, dist, strings.TrimPrefix(urlPath, "/")) {
			return
		}

		// A path that names a file but has none is a real 404. Answering it with
		// the app shell would hand the browser HTML where it asked for a script.
		if path.Ext(urlPath) != "" {
			c.Status(http.StatusNotFound)
			return
		}

		serveIndex(c, dist)
	}
}

// serveEmbedded writes one file out of the embedded build and reports whether it
// existed, so the caller can decide what a miss means.
//
// embed.FS reports a zero modification time, so ServeContent emits no
// Last-Modified and computes no ETag — without an explicit Cache-Control the
// browser has nothing to revalidate against and re-downloads the whole bundle on
// every visit.
func serveEmbedded(c *gin.Context, fsys http.FileSystem, name string) bool {
	if name == "" || name == "index.html" {
		return false // index.html goes through serveIndex, which injects the SEO block
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
	// stale and are safe to cache forever. Everything else must stay revalidated.
	if strings.HasPrefix(name, "assets/") {
		c.Header("Cache-Control", "public, max-age=31536000, immutable")
	} else {
		c.Header("Cache-Control", "no-cache")
	}

	http.ServeContent(c.Writer, c.Request, stat.Name(), stat.ModTime(), f)
	return true
}

func serveIndex(c *gin.Context, fsys http.FileSystem) {
	f, err := fsys.Open("index.html")
	if err != nil {
		c.String(http.StatusInternalServerError, "index.html not found")
		return
	}
	defer f.Close()

	shell, err := io.ReadAll(f)
	if err != nil {
		c.String(http.StatusInternalServerError, "index.html unreadable")
		return
	}

	// Never cache the shell: it carries the SEO block, which changes the moment
	// the admin saves a setting.
	c.Header("Cache-Control", "no-cache")
	c.Data(http.StatusOK, "text/html; charset=utf-8", injectSEO(c, shell))
}

// injectSEO replaces the marked block with tags built from the saved settings.
// Any failure returns the page untouched — stale metadata is a far better
// outcome than a site that will not load.
func injectSEO(c *gin.Context, shell []byte) []byte {
	page := string(shell)

	start := strings.Index(page, seoStart)
	end := strings.Index(page, seoEnd)
	if start < 0 || end < 0 || end < start {
		return shell
	}

	settings, err := services.GetSettings()
	if err != nil {
		return shell
	}

	name, tagline, logo := brandFrom(settings.Data)
	origin := requestOrigin(c)

	var b strings.Builder
	b.WriteString(seoStart)
	b.WriteString("\n    <title>")
	b.WriteString(html.EscapeString(name))
	b.WriteString("</title>")
	writeMeta(&b, `name="description"`, tagline)
	writeMeta(&b, `property="og:type"`, "website")
	writeMeta(&b, `property="og:site_name"`, name)
	writeMeta(&b, `property="og:title"`, name)
	writeMeta(&b, `property="og:description"`, tagline)
	writeMeta(&b, `property="og:url"`, origin+c.Request.URL.Path)
	writeMeta(&b, `name="twitter:card"`, "summary_large_image")
	writeMeta(&b, `name="twitter:title"`, name)
	writeMeta(&b, `name="twitter:description"`, tagline)

	// og:image must be absolute — a relative path is ignored by every scraper.
	if abs := absoluteMedia(origin, logo); abs != "" {
		writeMeta(&b, `property="og:image"`, abs)
		writeMeta(&b, `name="twitter:image"`, abs)
		b.WriteString("\n    <link rel=\"icon\" href=\"")
		b.WriteString(html.EscapeString(mediaPath(logo)))
		b.WriteString("\" />")
	} else {
		b.WriteString("\n    <link rel=\"icon\" href=\"/ImagineboIcon.svg\" />")
	}
	b.WriteString("\n    ")

	return []byte(page[:start] + b.String() + page[end:])
}

func writeMeta(b *strings.Builder, attr, content string) {
	if content == "" {
		return
	}
	b.WriteString("\n    <meta ")
	b.WriteString(attr)
	b.WriteString(` content="`)
	b.WriteString(html.EscapeString(content))
	b.WriteString(`" />`)
}

// brandFrom pulls the three fields the metadata needs out of the settings
// document, falling back to the shipped defaults for anything unset.
func brandFrom(data []byte) (name, tagline, logo string) {
	name, tagline = defaultBrandName, defaultTagline

	var doc struct {
		Brand struct {
			Name    string `json:"name"`
			Tagline string `json:"tagline"`
			LogoURL string `json:"logoUrl"`
		} `json:"brand"`
	}
	if len(data) == 0 || json.Unmarshal(data, &doc) != nil {
		return name, tagline, ""
	}

	if v := strings.TrimSpace(doc.Brand.Name); v != "" {
		name = v
	}
	if v := strings.TrimSpace(doc.Brand.Tagline); v != "" {
		tagline = v
	}
	return name, tagline, strings.TrimSpace(doc.Brand.LogoURL)
}

// requestOrigin reconstructs the public origin. Behind Railway's proxy the
// connection arrives as plain HTTP, so the forwarded scheme is what counts.
func requestOrigin(c *gin.Context) string {
	scheme := "https"
	if forwarded := c.GetHeader("X-Forwarded-Proto"); forwarded != "" {
		scheme = forwarded
	} else if c.Request.TLS == nil && strings.HasPrefix(c.Request.Host, "localhost") {
		scheme = "http"
	}
	return scheme + "://" + c.Request.Host
}

// mediaPath maps a stored image path to the URL a browser should request.
// Uploads live behind the API; anything else is a file in the SPA build.
func mediaPath(stored string) string {
	if strings.HasPrefix(stored, services.UploadURLPrefix) {
		return "/api" + stored
	}
	return stored
}

func absoluteMedia(origin, stored string) string {
	if stored == "" {
		return ""
	}
	if strings.HasPrefix(stored, "http://") || strings.HasPrefix(stored, "https://") {
		return stored
	}
	return origin + mediaPath(stored)
}

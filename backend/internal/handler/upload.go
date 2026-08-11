package handler

import (
	"io"
	"mime/multipart"
	"net/http"
	"path"
	"strings"

	"imagine_backend/internal/dto"
	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
)

// readFile pulls one multipart file fully into memory. Images are capped at 8MB and
// already compressed client-side, so buffering is cheaper than a temp file.
func readFile(fh *multipart.FileHeader) (services.FileInput, error) {
	f, err := fh.Open()
	if err != nil {
		return services.FileInput{}, err
	}
	defer f.Close()

	bytes, err := io.ReadAll(io.LimitReader(f, services.MaxUploadBytes+1))
	if err != nil {
		return services.FileInput{}, err
	}

	mime := fh.Header.Get("Content-Type")
	if mime == "" {
		// Fall back to the extension — some clients omit the part's Content-Type.
		switch strings.ToLower(path.Ext(fh.Filename)) {
		case ".png":
			mime = "image/png"
		case ".webp":
			mime = "image/webp"
		case ".gif":
			mime = "image/gif"
		default:
			mime = "image/jpeg"
		}
	}
	return services.FileInput{Filename: fh.Filename, MimeType: mime, Bytes: bytes}, nil
}

// UploadFile stores an image and returns its URL. No DB row beyond the image itself —
// product images come through here; proofs get their own row.
func UploadFile(c *gin.Context) {
	fh, err := c.FormFile("file")
	if err != nil {
		badRequest(c, "No file received")
		return
	}
	input, err := readFile(fh)
	if err != nil {
		respondError(c, err)
		return
	}
	url, err := services.StoreUpload(input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.UploadResponse{URL: url})
}

// ServeUpload streams a stored image back. Public: proof screenshots and product
// images are shown to every visitor.
func ServeUpload(c *gin.Context) {
	upload, err := services.GetUpload(c.Param("filename"))
	if err != nil {
		respondError(c, err)
		return
	}
	c.Header("Cache-Control", "public, max-age=604800, immutable")
	c.Data(http.StatusOK, upload.MimeType, upload.Bytes)
}

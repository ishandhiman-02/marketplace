package services

import (
	"crypto/rand"
	"encoding/hex"
	"path"
	"strings"

	"imagine_backend/internal/apperror"
	"imagine_backend/internal/model"
	"imagine_backend/internal/repositary"
)

// MaxUploadBytes matches the original limit — the browser compresses before upload.
const MaxUploadBytes = 8 << 20

// UploadURLPrefix is the path images are stored under. It is deliberately relative:
// the frontend joins it onto the API base, so the same row works whether the API is
// same-origin in dev or a different host in production.
const UploadURLPrefix = "/uploads/"

var (
	ErrNoFile         = apperror.BadRequest.With("No file received")
	ErrNotAnImage     = apperror.BadRequest.With("Only image files are allowed")
	ErrFileTooLarge   = apperror.BadRequest.With("Image is larger than 8MB")
	ErrUploadNotFound = apperror.NotFound.With("Upload not found")
)

// FileInput is one decoded multipart file, handed down from the handler so the
// service layer never touches net/http types.
type FileInput struct {
	Filename string
	MimeType string
	Bytes    []byte
}

func randomName() (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

// PrepareUpload validates one file and gives it a stored name, without touching
// the database. Split out so a batch of files can be checked and named up front
// and then written in a single insert.
func PrepareUpload(f FileInput) (model.Upload, error) {
	if len(f.Bytes) == 0 {
		return model.Upload{}, ErrNoFile
	}
	if len(f.Bytes) > MaxUploadBytes {
		return model.Upload{}, ErrFileTooLarge
	}
	if !strings.HasPrefix(f.MimeType, "image/") {
		return model.Upload{}, ErrNotAnImage
	}

	ext := strings.ToLower(path.Ext(f.Filename))
	if ext == "" {
		ext = ".jpg"
	}
	name, err := randomName()
	if err != nil {
		return model.Upload{}, err
	}

	return model.Upload{Filename: name + ext, MimeType: f.MimeType, Bytes: f.Bytes}, nil
}

// StoreUpload validates and persists one image, returning its public path.
func StoreUpload(f FileInput) (string, error) {
	upload, err := PrepareUpload(f)
	if err != nil {
		return "", err
	}
	if err := repositary.CreateUpload(&upload); err != nil {
		return "", err
	}
	return UploadURLPrefix + upload.Filename, nil
}

func GetUpload(filename string) (*model.Upload, error) {
	u, err := repositary.FindUploadByFilename(filename)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, ErrUploadNotFound
	}
	return u, nil
}

// RemoveUpload deletes the stored bytes behind a public URL. Failure is not fatal —
// an orphaned row is much better than a failed delete of the thing that owns it.
func RemoveUpload(publicURL string) error {
	name := path.Base(publicURL)
	if name == "" || name == "." || name == "/" {
		return nil
	}
	return repositary.DeleteUploadByFilename(name)
}

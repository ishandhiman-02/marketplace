package dto

import (
	"time"

	"imagine_backend/internal/model"
)

type SettingsRequest struct {
	Data model.JSONB `json:"data"`
}

type SettingsResponse struct {
	Data      model.JSONB `json:"data"`
	UpdatedAt *time.Time  `json:"updatedAt"`
}

type UploadResponse struct {
	URL string `json:"url"`
}

package services

import (
	"encoding/json"

	"imagine_backend/internal/apperror"
	"imagine_backend/internal/dto"
	"imagine_backend/internal/model"
	"imagine_backend/internal/repositary"
)

var ErrSettingsNotObject = apperror.BadRequest.With("Settings must be an object")

var emptyObjectJSON = model.JSONB("{}")

// GetSettings never 404s: an absent row means "everything as shipped", which the
// frontend represents by merging an empty document over its own defaults.
func GetSettings() (dto.SettingsResponse, error) {
	s, err := repositary.GetSettings()
	if err != nil {
		return dto.SettingsResponse{}, err
	}
	if s == nil {
		return dto.SettingsResponse{Data: emptyObjectJSON}, nil
	}
	data := s.Data
	if len(data) == 0 {
		data = emptyObjectJSON
	}
	updated := s.UpdatedAt
	return dto.SettingsResponse{Data: data, UpdatedAt: &updated}, nil
}

func SaveSettings(data model.JSONB) (dto.SettingsResponse, error) {
	if !isJSONObject(data) {
		return dto.SettingsResponse{}, ErrSettingsNotObject
	}
	s, err := repositary.SaveSettings(data)
	if err != nil {
		return dto.SettingsResponse{}, err
	}
	updated := s.UpdatedAt
	return dto.SettingsResponse{Data: s.Data, UpdatedAt: &updated}, nil
}

// ResetSettings puts the document back to empty — shipped defaults, without the
// admin hunting through every field.
func ResetSettings() (dto.SettingsResponse, error) {
	return SaveSettings(emptyObjectJSON)
}

// isJSONObject rejects null, arrays and scalars, matching the original guard.
func isJSONObject(raw model.JSONB) bool {
	if len(raw) == 0 {
		return false
	}
	var v any
	if err := json.Unmarshal(raw, &v); err != nil {
		return false
	}
	_, ok := v.(map[string]any)
	return ok
}

package services

import (
	"strings"

	"imagine_backend/internal/apperror"
	"imagine_backend/internal/dto"
	"imagine_backend/internal/model"
	"imagine_backend/internal/repositary"
)

var (
	ErrLeadNotFound  = apperror.NotFound.With("Lead not found")
	ErrLeadRequired  = apperror.BadRequest.With("Name and Instagram username are required")
	ErrInvalidStatus = apperror.BadRequest.With("Invalid status")
)

// truncate keeps the original column-width guards from the Express implementation.
func truncate(s string, max int) string {
	if len(s) > max {
		return s[:max]
	}
	return s
}

func CreateLead(req dto.LeadRequest) (*dto.LeadCreatedResponse, error) {
	name := strings.TrimSpace(req.Name)
	handle := strings.TrimPrefix(strings.TrimSpace(req.InstagramUsername), "@")
	if name == "" || handle == "" {
		return nil, ErrLeadRequired
	}

	lead := model.Lead{
		Name:              truncate(name, 120),
		InstagramUsername: truncate(handle, 60),
		Phone:             truncate(strings.TrimSpace(req.Phone), 30),
		ProductName:       truncate(req.ProductName, 200),
		Price:             req.Price,
		Status:            "new",
	}
	if err := repositary.CreateLead(&lead); err != nil {
		return nil, err
	}
	BumpRevision()
	return &dto.LeadCreatedResponse{ID: lead.ID}, nil
}

func ListLeads(status string, sinceDays int) ([]dto.LeadResponse, error) {
	leads, err := repositary.ListLeads(repositary.LeadFilter{Status: status, SinceDays: sinceDays})
	if err != nil {
		return nil, err
	}
	return dto.NewLeadResponses(leads), nil
}

func LeadStats() (dto.LeadStatsResponse, error) {
	return repositary.LeadStats()
}

func PatchLead(id uint, patch dto.LeadPatch) (*dto.LeadResponse, error) {
	fields := map[string]any{}
	if patch.Status != nil {
		if !model.IsValidLeadStatus(*patch.Status) {
			return nil, ErrInvalidStatus
		}
		fields["status"] = *patch.Status
	}
	if patch.Notes != nil {
		fields["notes"] = *patch.Notes
	}
	if len(fields) == 0 {
		return nil, ErrNothingToUpdate
	}

	// No existence pre-check — the read-back below already reports a missing row.
	if err := repositary.UpdateLeadFields(id, fields); err != nil {
		return nil, err
	}
	BumpRevision()

	updated, err := repositary.FindLead(id)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, ErrLeadNotFound
	}
	res := dto.NewLeadResponse(*updated)
	return &res, nil
}

func DeleteLead(id uint) error {
	ok, err := repositary.DeleteLead(id)
	if err != nil {
		return err
	}
	if !ok {
		return ErrLeadNotFound
	}
	BumpRevision()
	return nil
}

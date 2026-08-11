package dto

import (
	"time"

	"imagine_backend/internal/model"
)

type LeadRequest struct {
	Name              string `json:"name"`
	InstagramUsername string `json:"instagramUsername"`
	Phone             string `json:"phone"`
	ProductName       string `json:"productName"`
	Price             *int   `json:"price"`
}

type LeadPatch struct {
	Status *string `json:"status"`
	Notes  *string `json:"notes"`
}

// LeadCreatedResponse deliberately returns only an id — POST /leads is public and
// must never echo anyone else's data back.
type LeadCreatedResponse struct {
	ID uint `json:"id"`
}

type LeadResponse struct {
	ID                uint      `json:"id"`
	Name              string    `json:"name"`
	InstagramUsername string    `json:"instagramUsername"`
	Phone             string    `json:"phone"`
	ProductName       string    `json:"productName"`
	Price             *int      `json:"price"`
	Status            string    `json:"status"`
	Notes             string    `json:"notes"`
	CreatedAt         time.Time `json:"createdAt"`
}

type LeadStatsResponse struct {
	Today     int64 `json:"today"`
	ThisWeek  int64 `json:"thisWeek"`
	PaidCount int64 `json:"paidCount"`
	NewCount  int64 `json:"newCount"`
	Revenue   int64 `json:"revenue"`
	Total     int64 `json:"total"`
}

func NewLeadResponse(l model.Lead) LeadResponse {
	return LeadResponse{
		ID:                l.ID,
		Name:              l.Name,
		InstagramUsername: l.InstagramUsername,
		Phone:             l.Phone,
		ProductName:       l.ProductName,
		Price:             l.Price,
		Status:            l.Status,
		Notes:             l.Notes,
		CreatedAt:         l.CreatedAt,
	}
}

func NewLeadResponses(ls []model.Lead) []LeadResponse {
	return mapSlice(ls, NewLeadResponse)
}

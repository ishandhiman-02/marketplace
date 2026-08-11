package dto

import (
	"time"

	"imagine_backend/internal/model"
)

type ProofPatch struct {
	Caption     *string `json:"caption"`
	ProductName *string `json:"productName"`
	IsActive    *bool   `json:"isActive"`
	SortOrder   *int    `json:"sortOrder"`
}

type ProofResponse struct {
	ID          uint      `json:"id"`
	ImageURL    string    `json:"imageUrl"`
	Caption     string    `json:"caption"`
	ProductName string    `json:"productName"`
	IsActive    bool      `json:"isActive"`
	SortOrder   int       `json:"sortOrder"`
	CreatedAt   time.Time `json:"createdAt"`
}

func NewProofResponse(p model.Proof) ProofResponse {
	return ProofResponse{
		ID:          p.ID,
		ImageURL:    p.ImageURL,
		Caption:     p.Caption,
		ProductName: p.ProductName,
		IsActive:    p.IsActive,
		SortOrder:   p.SortOrder,
		CreatedAt:   p.CreatedAt,
	}
}

func NewProofResponses(ps []model.Proof) []ProofResponse {
	return mapSlice(ps, NewProofResponse)
}

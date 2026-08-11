package dto

import "imagine_backend/internal/model"

// ProductRequest is the full-replace body used by POST and PUT.
// Pointers are not needed here: the admin form always submits the whole shape.
type ProductRequest struct {
	Title       string      `json:"title"`
	Subtitle    string      `json:"subtitle"`
	Description string      `json:"description"`
	Category    string      `json:"category"`
	Price       *int        `json:"price"`
	Duration    string      `json:"duration"`
	Tag         string      `json:"tag"`
	TagColor    string      `json:"tagColor"`
	Color       string      `json:"color"`
	Icon        string      `json:"icon"`
	Image       string      `json:"image"`
	Variants    model.JSONB `json:"variants"`
	IsActive    *bool       `json:"isActive"`
	SortOrder   *int        `json:"sortOrder"`
}

// ProductPatch is the partial update behind the inline price / visibility edits.
// Every field is a pointer so "absent" is distinguishable from "set to zero".
type ProductPatch struct {
	Price     *int  `json:"price"`
	IsActive  *bool `json:"isActive"`
	SortOrder *int  `json:"sortOrder"`
}

type ProductResponse struct {
	ID          uint        `json:"id"`
	Title       string      `json:"title"`
	Subtitle    string      `json:"subtitle"`
	Description string      `json:"description"`
	Category    string      `json:"category"`
	Price       int         `json:"price"`
	Duration    string      `json:"duration"`
	Tag         string      `json:"tag"`
	TagColor    string      `json:"tagColor"`
	Color       string      `json:"color"`
	Icon        string      `json:"icon"`
	Image       string      `json:"image"`
	Variants    model.JSONB `json:"variants,omitempty"`
	IsActive    bool        `json:"isActive"`
	SortOrder   int         `json:"sortOrder"`
}

func NewProductResponse(p model.Product) ProductResponse {
	return ProductResponse{
		ID:          p.ID,
		Title:       p.Title,
		Subtitle:    p.Subtitle,
		Description: p.Description,
		Category:    p.Category,
		Price:       p.Price,
		Duration:    p.Duration,
		Tag:         p.Tag,
		TagColor:    p.TagColor,
		Color:       p.Color,
		Icon:        p.Icon,
		Image:       p.ImageURL,
		Variants:    p.Variants,
		IsActive:    p.IsActive,
		SortOrder:   p.SortOrder,
	}
}

func NewProductResponses(ps []model.Product) []ProductResponse {
	return mapSlice(ps, NewProductResponse)
}

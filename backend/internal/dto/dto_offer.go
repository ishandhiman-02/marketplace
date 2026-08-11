package dto

import (
	"time"

	"imagine_backend/internal/model"
)

type OfferRequest struct {
	Emoji         string     `json:"emoji"`
	Title         string     `json:"title"`
	Subtitle      string     `json:"subtitle"`
	Description   string     `json:"description"`
	OriginalPrice *int       `json:"originalPrice"`
	DealPrice     *int       `json:"dealPrice"`
	Tag           string     `json:"tag"`
	TagColor      string     `json:"tagColor"`
	Slots         *int       `json:"slots"`
	SlotsLeft     *int       `json:"slotsLeft"`
	ExpiresAt     *time.Time `json:"expiresAt"`
	IsActive      *bool      `json:"isActive"`
}

type OfferResponse struct {
	ID          uint   `json:"id"`
	Emoji       string `json:"emoji"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Description string `json:"description"`
	// Kept nullable so the UI can tell "no original price" from "zero".
	OriginalPrice *int       `json:"originalPrice"`
	DealPrice     int        `json:"dealPrice"`
	Savings       int        `json:"savings"`
	Tag           string     `json:"tag"`
	TagColor      string     `json:"tagColor"`
	Slots         int        `json:"slots"`
	SlotsLeft     int        `json:"slotsLeft"`
	ExpiresAt     *time.Time `json:"expiresAt"`
	IsActive      bool       `json:"isActive"`
}

func NewOfferResponse(o model.DailyOffer) OfferResponse {
	original := 0
	if o.OriginalPrice != nil {
		original = *o.OriginalPrice
	}
	return OfferResponse{
		ID:            o.ID,
		Emoji:         o.Emoji,
		Title:         o.Title,
		Subtitle:      o.Subtitle,
		Description:   o.Description,
		OriginalPrice: o.OriginalPrice,
		DealPrice:     o.DealPrice,
		Savings:       original - o.DealPrice,
		Tag:           o.Tag,
		TagColor:      o.TagColor,
		Slots:         o.SlotsTotal,
		SlotsLeft:     o.SlotsLeft,
		ExpiresAt:     o.ExpiresAt,
		IsActive:      o.IsActive,
	}
}

func NewOfferResponses(os []model.DailyOffer) []OfferResponse {
	return mapSlice(os, NewOfferResponse)
}

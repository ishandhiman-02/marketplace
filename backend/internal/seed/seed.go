// Package seed carries the catalogue a brand-new deployment starts with.
//
// catalog.json is generated from frontend/src/data — the same arrays the
// storefront falls back to when it cannot reach the API. That is deliberate: a
// fresh deploy otherwise migrates an empty schema, the API answers `[]`, and the
// storefront replaces its bundled fallback with nothing. The result is a site
// whose cards appear for one frame and then vanish.
//
// Regenerate with the snippet in the repo README when the bundled data changes.
package seed

import (
	_ "embed"
	"encoding/json"
	"fmt"

	"imagine_backend/internal/model"
)

//go:embed catalog.json
var catalogJSON []byte

type catalogFile struct {
	Products []struct {
		Title       string          `json:"title"`
		Subtitle    string          `json:"subtitle"`
		Description string          `json:"description"`
		Category    string          `json:"category"`
		Price       int             `json:"price"`
		Duration    string          `json:"duration"`
		Tag         string          `json:"tag"`
		TagColor    string          `json:"tagColor"`
		Color       string          `json:"color"`
		Icon        string          `json:"icon"`
		Image       string          `json:"image"`
		Variants    json.RawMessage `json:"variants"`
		SortOrder   int             `json:"sortOrder"`
	} `json:"products"`

	Offers []struct {
		Emoji         string `json:"emoji"`
		Title         string `json:"title"`
		Subtitle      string `json:"subtitle"`
		Description   string `json:"description"`
		OriginalPrice *int   `json:"originalPrice"`
		DealPrice     int    `json:"dealPrice"`
		Tag           string `json:"tag"`
		TagColor      string `json:"tagColor"`
		Slots         int    `json:"slots"`
		SlotsLeft     int    `json:"slotsLeft"`
	} `json:"offers"`
}

// Catalog decodes the shipped starter catalogue into models ready to insert.
func Catalog() ([]model.Product, []model.DailyOffer, error) {
	var file catalogFile
	if err := json.Unmarshal(catalogJSON, &file); err != nil {
		return nil, nil, fmt.Errorf("decode seed catalog: %w", err)
	}

	products := make([]model.Product, 0, len(file.Products))
	for _, p := range file.Products {
		variants := model.JSONB(p.Variants)
		if len(variants) == 0 {
			variants = model.JSONB("[]")
		}
		products = append(products, model.Product{
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
			ImageURL:    p.Image,
			Variants:    variants,
			SortOrder:   p.SortOrder,
			IsActive:    true,
		})
	}

	offers := make([]model.DailyOffer, 0, len(file.Offers))
	for _, o := range file.Offers {
		offers = append(offers, model.DailyOffer{
			Emoji:         o.Emoji,
			Title:         o.Title,
			Subtitle:      o.Subtitle,
			Description:   o.Description,
			OriginalPrice: o.OriginalPrice,
			DealPrice:     o.DealPrice,
			Tag:           o.Tag,
			TagColor:      o.TagColor,
			SlotsTotal:    o.Slots,
			SlotsLeft:     o.SlotsLeft,
			IsActive:      true,
		})
	}

	return products, offers, nil
}

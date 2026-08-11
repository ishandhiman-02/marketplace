package model

import "time"

type Product struct {
	ID          uint   `gorm:"primaryKey"`
	Title       string `gorm:"not null"`
	Subtitle    string
	Description string
	Category    string `gorm:"index"`
	Price       int    `gorm:"not null"`
	Duration    string
	Tag         string
	TagColor    string
	Color       string
	Icon        string
	ImageURL    string
	// The brand's own mark, shown on the card badge. Separate from ImageURL:
	// that is the wide photo behind the card, this is the small square logo.
	LogoURL  string
	Variants JSONB `gorm:"type:jsonb"`
	// No `default:true` on purpose: GORM omits zero-valued fields from an INSERT
	// when the tag carries a default, so an explicit `false` would silently come
	// back as `true`. The service layer supplies the default instead.
	IsActive  bool `gorm:"not null;index"`
	SortOrder int  `gorm:"not null;default:0;index"`
	CreatedAt time.Time
}

func (Product) TableName() string { return "products" }

package model

import "time"

type DailyOffer struct {
	ID          uint `gorm:"primaryKey"`
	Emoji       string
	Title       string `gorm:"not null"`
	Subtitle    string
	Description string
	// Nullable on purpose: no original price means no strike-through in the UI,
	// which is not the same thing as an original price of zero.
	OriginalPrice *int
	DealPrice     int `gorm:"not null"`
	Tag           string
	TagColor      string
	SlotsTotal    int        `gorm:"not null;default:0"`
	SlotsLeft     int        `gorm:"not null;default:0"`
	ExpiresAt     *time.Time `gorm:"index"`
	// No `default:true` on purpose: GORM omits zero-valued fields from an INSERT
	// when the tag carries a default, so an explicit `false` would silently come
	// back as `true`. The service layer supplies the default instead.
	IsActive bool `gorm:"not null;index"`
	// A third state, distinct from paused. Paused means "not selling right now";
	// archived means "put away" — kept for the record and for duplicating next
	// season, but out of the working list and never shown to a visitor.
	// `default:false` is required, not decoration: without it Postgres refuses to
	// add a NOT NULL column to a table that already has rows, so the migration
	// fails on every existing deployment. Defaulting to the zero value is safe
	// here — unlike `default:true`, which GORM would let a zero value silently
	// override (see the note on IsActive).
	IsArchived bool `gorm:"not null;default:false;index"`
	CreatedAt  time.Time
}

func (DailyOffer) TableName() string { return "daily_offers" }

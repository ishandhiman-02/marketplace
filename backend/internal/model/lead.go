package model

import (
	"slices"
	"time"
)

// Lead records who is buying. The purchase itself happens in an Instagram DM,
// so the site creates a lead just before opening that DM.
type Lead struct {
	ID                uint   `gorm:"primaryKey"`
	Name              string `gorm:"not null"`
	InstagramUsername string `gorm:"not null"`
	Phone             string
	ProductName       string
	// Nullable: a lead can exist before a price is known.
	Price *int
	// No `default:` tag, matching the other models — the service sets the initial
	// status. Two sources of truth for one default is how they drift apart.
	Status    string `gorm:"not null;index"`
	Notes     string
	CreatedAt time.Time `gorm:"index"`
}

func (Lead) TableName() string { return "leads" }

// LeadStatuses is the allowed set; mirrored from the original check constraint.
var LeadStatuses = []string{"new", "contacted", "paid", "delivered", "cancelled"}

func IsValidLeadStatus(s string) bool {
	return slices.Contains(LeadStatuses, s)
}

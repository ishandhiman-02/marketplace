package model

import "time"

// SiteSetting is a single row (ID is pinned to 1) holding everything the admin can
// change about the public UI without a code deploy. One JSON document rather than a
// column per setting: adding a setting costs nothing schema-side, and a save is
// atomic — the admin never sees half a form applied.
type SiteSetting struct {
	ID        uint  `gorm:"primaryKey"`
	Data      JSONB `gorm:"type:jsonb;not null"`
	UpdatedAt time.Time
}

func (SiteSetting) TableName() string { return "site_settings" }

// SiteSettingRowID is the only row this table ever holds.
const SiteSettingRowID = 1

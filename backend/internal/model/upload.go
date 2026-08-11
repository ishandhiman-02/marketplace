package model

import "time"

// Upload stores image bytes in Postgres rather than on disk.
//
// The deploy grants no object-storage env vars and the container filesystem is
// ephemeral, so anything written to disk disappears on the next deploy. Postgres
// is the only durable store this service is given, so proof screenshots and
// product images live here and are served back from /api/uploads/:filename.
type Upload struct {
	ID        uint   `gorm:"primaryKey"`
	Filename  string `gorm:"uniqueIndex;not null"`
	MimeType  string `gorm:"not null"`
	Bytes     []byte `gorm:"type:bytea;not null"`
	CreatedAt time.Time
}

func (Upload) TableName() string { return "uploads" }

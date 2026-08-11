package model

import "time"

type Proof struct {
	ID          uint   `gorm:"primaryKey"`
	ImageURL    string `gorm:"not null"`
	Caption     string
	ProductName string
	// No `default:true` on purpose — see the note on Product.IsActive.
	IsActive  bool `gorm:"not null;index"`
	SortOrder int  `gorm:"not null;default:0;index"`
	CreatedAt time.Time
}

func (Proof) TableName() string { return "proofs" }

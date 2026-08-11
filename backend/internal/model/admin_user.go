package model

import "time"

// AdminUser backs admin login only. There is no public signup anywhere — accounts
// are created by the migration bootstrap.
type AdminUser struct {
	ID           uint   `gorm:"primaryKey"`
	Email        string `gorm:"uniqueIndex;not null"`
	PasswordHash string `gorm:"not null"`
	CreatedAt    time.Time
}

func (AdminUser) TableName() string { return "admin_users" }

package repositary

import (
	"imagine_backend/internal/db"
	"imagine_backend/internal/model"
)

// FindAdminByEmail returns nil (and no error) when no such admin exists, so callers
// can treat "unknown email" and "wrong password" identically.
func FindAdminByEmail(email string) (*model.AdminUser, error) {
	var user model.AdminUser
	if err := db.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, ignoreNotFound(err)
	}
	return &user, nil
}

func CountAdmins() (int64, error) {
	var n int64
	err := db.DB.Model(&model.AdminUser{}).Count(&n).Error
	return n, err
}

func CreateAdmin(user *model.AdminUser) error {
	return db.DB.Create(user).Error
}

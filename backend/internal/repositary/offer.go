package repositary

import (
	"time"

	"imagine_backend/internal/db"
	"imagine_backend/internal/model"
)

// ListLiveOffers returns only offers a visitor should see: active, slots remaining,
// and either no expiry or an expiry still in the future.
func ListLiveOffers() ([]model.DailyOffer, error) {
	var offers []model.DailyOffer
	err := db.DB.
		Where("is_active = ?", true).
		Where("slots_left > ?", 0).
		Where("expires_at IS NULL OR expires_at > ?", time.Now()).
		Order("created_at desc").
		Find(&offers).Error
	return offers, err
}

func ListAllOffers() ([]model.DailyOffer, error) {
	var offers []model.DailyOffer
	err := db.DB.Order("created_at desc").Find(&offers).Error
	return offers, err
}

func FindOffer(id uint) (*model.DailyOffer, error) {
	return findByID[model.DailyOffer](id)
}

func CountOffers() (int64, error) {
	var n int64
	err := db.DB.Model(&model.DailyOffer{}).Count(&n).Error
	return n, err
}

func CreateOffer(o *model.DailyOffer) error {
	return db.DB.Create(o).Error
}

// CreateOffers inserts a batch as a single multi-row INSERT.
func CreateOffers(offers []model.DailyOffer) error {
	if len(offers) == 0 {
		return nil
	}
	return db.DB.Create(&offers).Error
}

func SaveOffer(o *model.DailyOffer) error {
	return db.DB.Model(o).Select("*").Omit("id", "created_at").Updates(o).Error
}

func DeleteOffer(id uint) (bool, error) {
	return deleteByID[model.DailyOffer](id)
}

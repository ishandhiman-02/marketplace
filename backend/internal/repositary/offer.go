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

func CreateOffer(o *model.DailyOffer) error {
	return db.DB.Create(o).Error
}

func SaveOffer(o *model.DailyOffer) error {
	return db.DB.Model(o).Select("*").Omit("id", "created_at").Updates(o).Error
}

func DeleteOffer(id uint) (bool, error) {
	return deleteByID[model.DailyOffer](id)
}

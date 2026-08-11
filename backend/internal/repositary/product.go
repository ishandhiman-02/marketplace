package repositary

import (
	"imagine_backend/internal/db"
	"imagine_backend/internal/model"
)

func ListProducts(includeInactive bool) ([]model.Product, error) {
	var products []model.Product
	q := db.DB.Order("sort_order").Order("created_at")
	if !includeInactive {
		q = q.Where("is_active = ?", true)
	}
	err := q.Find(&products).Error
	return products, err
}

func FindProduct(id uint) (*model.Product, error) {
	return findByID[model.Product](id)
}

func CountProducts() (int64, error) {
	var n int64
	err := db.DB.Model(&model.Product{}).Count(&n).Error
	return n, err
}

func CreateProduct(p *model.Product) error {
	return db.DB.Create(p).Error
}

// CreateProducts inserts a batch as a single multi-row INSERT.
func CreateProducts(products []model.Product) error {
	if len(products) == 0 {
		return nil
	}
	return db.DB.Create(&products).Error
}

// SaveProduct writes every column, including zero values — Select("*") is required
// or GORM would silently skip false/0/"" fields on update.
func SaveProduct(p *model.Product) error {
	return db.DB.Model(p).Select("*").Omit("id", "created_at").Updates(p).Error
}

func UpdateProductFields(id uint, fields map[string]any) error {
	return updateFields[model.Product](id, fields)
}

func DeleteProduct(id uint) (bool, error) {
	return deleteByID[model.Product](id)
}

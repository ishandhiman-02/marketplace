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

func CreateProduct(p *model.Product) error {
	return db.DB.Create(p).Error
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

package repositary

import (
	"imagine_backend/internal/db"
	"imagine_backend/internal/model"
)

func ListProofs(includeInactive bool) ([]model.Proof, error) {
	var proofs []model.Proof
	q := db.DB.Order("sort_order").Order("created_at desc")
	if !includeInactive {
		q = q.Where("is_active = ?", true)
	}
	err := q.Find(&proofs).Error
	return proofs, err
}

func FindProof(id uint) (*model.Proof, error) {
	return findByID[model.Proof](id)
}

func CreateProof(p *model.Proof) error {
	return db.DB.Create(p).Error
}

// CreateProofs inserts a batch as a single multi-row INSERT — a dozen
// screenshots arriving together should not be a dozen round-trips.
func CreateProofs(proofs []model.Proof) error {
	if len(proofs) == 0 {
		return nil
	}
	return db.DB.Create(&proofs).Error
}

func UpdateProofFields(id uint, fields map[string]any) error {
	return updateFields[model.Proof](id, fields)
}

func DeleteProof(id uint) (bool, error) {
	return deleteByID[model.Proof](id)
}

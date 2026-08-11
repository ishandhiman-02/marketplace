package repositary

import (
	"errors"

	"imagine_backend/internal/db"

	"gorm.io/gorm"
)

// The three shapes every entity needs, written once.
//
// Each entity's file wraps these with a named, typed function so callers still
// read as ProductRepo-style code. Keeping the bodies here means the
// "gorm.ErrRecordNotFound means (nil, nil), not an error" convention is stated
// in exactly one place — changing it later is one edit, not seven, and the
// copies cannot drift apart in the meantime.

// ignoreNotFound turns "no such row" into a nil error, for lookups keyed on
// something other than the primary key.
func ignoreNotFound(err error) error {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil
	}
	return err
}

// findByID returns (nil, nil) when the row is absent, so callers can tell "no
// such record" from "the query failed" without inspecting driver errors.
func findByID[T any](id uint) (*T, error) {
	var row T
	if err := db.DB.First(&row, id).Error; err != nil {
		return nil, ignoreNotFound(err)
	}
	return &row, nil
}

// deleteByID reports whether a row was actually removed, which is what separates
// a successful delete from a 404.
func deleteByID[T any](id uint) (bool, error) {
	var row T
	res := db.DB.Delete(&row, id)
	return res.RowsAffected > 0, res.Error
}

// updateFields applies a partial update. The caller owns the column map, because
// only it knows which request fields were actually present.
func updateFields[T any](id uint, fields map[string]any) error {
	var row T
	return db.DB.Model(&row).Where("id = ?", id).Updates(fields).Error
}

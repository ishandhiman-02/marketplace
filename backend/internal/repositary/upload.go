package repositary

import (
	"imagine_backend/internal/db"
	"imagine_backend/internal/model"
)

func CreateUpload(u *model.Upload) error {
	return db.DB.Create(u).Error
}

// CreateUploads inserts a batch as a single multi-row INSERT.
func CreateUploads(uploads []model.Upload) error {
	if len(uploads) == 0 {
		return nil
	}
	return db.DB.Create(&uploads).Error
}

func FindUploadByFilename(name string) (*model.Upload, error) {
	var u model.Upload
	err := db.DB.Where("filename = ?", name).First(&u).Error
	if err != nil {
		return nil, ignoreNotFound(err)
	}
	return &u, nil
}

func DeleteUploadByFilename(name string) error {
	return db.DB.Where("filename = ?", name).Delete(&model.Upload{}).Error
}

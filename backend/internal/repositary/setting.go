package repositary

import (
	"imagine_backend/internal/db"
	"imagine_backend/internal/model"
)

func GetSettings() (*model.SiteSetting, error) {
	return findByID[model.SiteSetting](model.SiteSettingRowID)
}

// SaveSettings upserts the single settings row. A full replace, not a deep merge —
// the admin form always submits the complete document, and a merge would make
// deleting a nav link or a trust item impossible.
func SaveSettings(data model.JSONB) (*model.SiteSetting, error) {
	s := model.SiteSetting{ID: model.SiteSettingRowID, Data: data}
	if err := db.DB.Save(&s).Error; err != nil {
		return nil, err
	}
	return &s, nil
}

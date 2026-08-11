package repositary

import (
	"time"

	"imagine_backend/internal/db"
	"imagine_backend/internal/dto"
	"imagine_backend/internal/model"
)

type LeadFilter struct {
	Status    string
	SinceDays int
}

func ListLeads(f LeadFilter) ([]model.Lead, error) {
	var leads []model.Lead
	q := db.DB.Order("created_at desc")
	if f.Status != "" {
		q = q.Where("status = ?", f.Status)
	}
	if f.SinceDays > 0 {
		q = q.Where("created_at >= ?", time.Now().AddDate(0, 0, -f.SinceDays))
	}
	err := q.Find(&leads).Error
	return leads, err
}

func FindLead(id uint) (*model.Lead, error) {
	return findByID[model.Lead](id)
}

func CreateLead(l *model.Lead) error {
	return db.DB.Create(l).Error
}

func UpdateLeadFields(id uint, fields map[string]any) error {
	return updateFields[model.Lead](id, fields)
}

func DeleteLead(id uint) (bool, error) {
	return deleteByID[model.Lead](id)
}

// LeadStats computes the dashboard's six numbers in a single pass, mirroring the
// original `count(*) filter (where ...)` query.
func LeadStats() (dto.LeadStatsResponse, error) {
	var stats dto.LeadStatsResponse
	err := db.DB.Model(&model.Lead{}).
		Select(`
			count(*) filter (where created_at >= date_trunc('day', now()))        as today,
			count(*) filter (where created_at >= now() - interval '7 days')       as this_week,
			count(*) filter (where status in ('paid','delivered'))                as paid_count,
			count(*) filter (where status = 'new')                                as new_count,
			coalesce(sum(price) filter (where status in ('paid','delivered')), 0) as revenue,
			count(*)                                                              as total`).
		Scan(&stats).Error
	return stats, err
}

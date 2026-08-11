package services

import (
	"imagine_backend/internal/apperror"
	"imagine_backend/internal/dto"
	"imagine_backend/internal/model"
	"imagine_backend/internal/repositary"
)

var (
	ErrOfferNotFound = apperror.NotFound.With("Offer not found")
	ErrOfferRequired = apperror.BadRequest.With("Title and deal price are required")
)

func ListOffers(includeInactive bool) ([]dto.OfferResponse, error) {
	var (
		offers []model.DailyOffer
		err    error
	)
	if includeInactive {
		offers, err = repositary.ListAllOffers()
	} else {
		offers, err = repositary.ListLiveOffers()
	}
	if err != nil {
		return nil, err
	}
	return dto.NewOfferResponses(offers), nil
}

func applyOfferRequest(o *model.DailyOffer, req dto.OfferRequest) {
	o.Emoji = req.Emoji
	o.Title = req.Title
	o.Subtitle = req.Subtitle
	o.Description = req.Description
	o.OriginalPrice = req.OriginalPrice
	if req.DealPrice != nil {
		o.DealPrice = *req.DealPrice
	}
	o.Tag = req.Tag
	o.TagColor = req.TagColor
	o.SlotsTotal = 0
	if req.Slots != nil {
		o.SlotsTotal = *req.Slots
	}
	o.SlotsLeft = 0
	if req.SlotsLeft != nil {
		o.SlotsLeft = *req.SlotsLeft
	}
	o.ExpiresAt = req.ExpiresAt
	o.IsActive = true
	if req.IsActive != nil {
		o.IsActive = *req.IsActive
	}
}

func CreateOffer(req dto.OfferRequest) (*dto.OfferResponse, error) {
	if req.Title == "" || req.DealPrice == nil {
		return nil, ErrOfferRequired
	}
	var o model.DailyOffer
	applyOfferRequest(&o, req)
	if err := repositary.CreateOffer(&o); err != nil {
		return nil, err
	}
	res := dto.NewOfferResponse(o)
	return &res, nil
}

func UpdateOffer(id uint, req dto.OfferRequest) (*dto.OfferResponse, error) {
	existing, err := repositary.FindOffer(id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, ErrOfferNotFound
	}
	applyOfferRequest(existing, req)
	if err := repositary.SaveOffer(existing); err != nil {
		return nil, err
	}
	res := dto.NewOfferResponse(*existing)
	return &res, nil
}

// DuplicateOffer copies an offer into a fresh, inactive one with slots reset and no
// expiry — saves writing tomorrow's deal from scratch.
func DuplicateOffer(id uint) (*dto.OfferResponse, error) {
	src, err := repositary.FindOffer(id)
	if err != nil {
		return nil, err
	}
	if src == nil {
		return nil, ErrOfferNotFound
	}

	copied := model.DailyOffer{
		Emoji:         src.Emoji,
		Title:         src.Title,
		Subtitle:      src.Subtitle,
		Description:   src.Description,
		OriginalPrice: src.OriginalPrice,
		DealPrice:     src.DealPrice,
		Tag:           src.Tag,
		TagColor:      src.TagColor,
		SlotsTotal:    src.SlotsTotal,
		SlotsLeft:     src.SlotsTotal,
		ExpiresAt:     nil,
		IsActive:      false,
	}
	if err := repositary.CreateOffer(&copied); err != nil {
		return nil, err
	}
	res := dto.NewOfferResponse(copied)
	return &res, nil
}

func DeleteOffer(id uint) error {
	ok, err := repositary.DeleteOffer(id)
	if err != nil {
		return err
	}
	if !ok {
		return ErrOfferNotFound
	}
	return nil
}

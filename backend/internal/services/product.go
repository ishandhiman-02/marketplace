package services

import (
	"imagine_backend/internal/apperror"
	"imagine_backend/internal/dto"
	"imagine_backend/internal/model"
	"imagine_backend/internal/repositary"
)

var (
	ErrProductNotFound = apperror.NotFound.With("Product not found")
	ErrProductRequired = apperror.BadRequest.With("Title and price are required")
	ErrNothingToUpdate = apperror.BadRequest.With("Nothing to update")
	emptyVariantsJSON  = model.JSONB("[]")
)

func ListProducts(includeInactive bool) ([]dto.ProductResponse, error) {
	products, err := repositary.ListProducts(includeInactive)
	if err != nil {
		return nil, err
	}
	return dto.NewProductResponses(products), nil
}

func applyProductRequest(p *model.Product, req dto.ProductRequest) {
	p.Title = req.Title
	p.Subtitle = req.Subtitle
	p.Description = req.Description
	p.Category = req.Category
	if req.Price != nil {
		p.Price = *req.Price
	}
	p.Duration = req.Duration
	p.Tag = req.Tag
	p.TagColor = req.TagColor
	p.Color = req.Color
	p.Icon = req.Icon
	p.ImageURL = req.Image
	p.LogoURL = req.Logo
	p.Variants = req.Variants
	if len(p.Variants) == 0 {
		p.Variants = emptyVariantsJSON
	}
	p.IsActive = true
	if req.IsActive != nil {
		p.IsActive = *req.IsActive
	}
	p.SortOrder = 0
	if req.SortOrder != nil {
		p.SortOrder = *req.SortOrder
	}
}

func CreateProduct(req dto.ProductRequest) (*dto.ProductResponse, error) {
	if req.Title == "" || req.Price == nil {
		return nil, ErrProductRequired
	}
	var p model.Product
	applyProductRequest(&p, req)
	if err := repositary.CreateProduct(&p); err != nil {
		return nil, err
	}
	BumpRevision()
	res := dto.NewProductResponse(p)
	return &res, nil
}

func UpdateProduct(id uint, req dto.ProductRequest) (*dto.ProductResponse, error) {
	existing, err := repositary.FindProduct(id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, ErrProductNotFound
	}
	applyProductRequest(existing, req)
	if err := repositary.SaveProduct(existing); err != nil {
		return nil, err
	}
	BumpRevision()
	res := dto.NewProductResponse(*existing)
	return &res, nil
}

func PatchProduct(id uint, patch dto.ProductPatch) (*dto.ProductResponse, error) {
	fields := map[string]any{}
	if patch.Price != nil {
		fields["price"] = *patch.Price
	}
	if patch.IsActive != nil {
		fields["is_active"] = *patch.IsActive
	}
	if patch.SortOrder != nil {
		fields["sort_order"] = *patch.SortOrder
	}
	if len(fields) == 0 {
		return nil, ErrNothingToUpdate
	}

	// No existence pre-check: the read-back below already reports a missing row,
	// and updating zero rows is harmless.
	if err := repositary.UpdateProductFields(id, fields); err != nil {
		return nil, err
	}
	BumpRevision()

	updated, err := repositary.FindProduct(id)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, ErrProductNotFound
	}
	res := dto.NewProductResponse(*updated)
	return &res, nil
}

func DeleteProduct(id uint) error {
	ok, err := repositary.DeleteProduct(id)
	if err != nil {
		return err
	}
	if !ok {
		return ErrProductNotFound
	}
	BumpRevision()
	return nil
}

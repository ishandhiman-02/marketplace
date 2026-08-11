package services

import (
	"log"

	"imagine_backend/internal/apperror"
	"imagine_backend/internal/dto"
	"imagine_backend/internal/model"
	"imagine_backend/internal/repositary"
)

var ErrProofNotFound = apperror.NotFound.With("Proof not found")

func ListProofs(includeInactive bool) ([]dto.ProofResponse, error) {
	proofs, err := repositary.ListProofs(includeInactive)
	if err != nil {
		return nil, err
	}
	return dto.NewProofResponses(proofs), nil
}

// CreateProofs stores several screenshots at once — they arrive already compressed
// from the client.
func CreateProofs(files []FileInput, caption, productName string) ([]dto.ProofResponse, error) {
	if len(files) == 0 {
		return nil, ErrNoFile
	}

	// Validate and name everything first, then write in two batch inserts rather
	// than two per file — a dozen screenshots was two dozen round-trips.
	uploads := make([]model.Upload, 0, len(files))
	proofs := make([]model.Proof, 0, len(files))
	for _, f := range files {
		upload, err := PrepareUpload(f)
		if err != nil {
			return nil, err
		}
		uploads = append(uploads, upload)
		// IsActive is set here rather than by a column default — see the note on
		// Product.IsActive for why the model carries no `default:true`.
		proofs = append(proofs, model.Proof{
			ImageURL:    UploadURLPrefix + upload.Filename,
			Caption:     caption,
			ProductName: productName,
			IsActive:    true,
		})
	}

	if err := repositary.CreateUploads(uploads); err != nil {
		return nil, err
	}
	if err := repositary.CreateProofs(proofs); err != nil {
		return nil, err
	}
	return dto.NewProofResponses(proofs), nil
}

func PatchProof(id uint, patch dto.ProofPatch) (*dto.ProofResponse, error) {
	fields := map[string]any{}
	if patch.Caption != nil {
		fields["caption"] = *patch.Caption
	}
	if patch.ProductName != nil {
		fields["product_name"] = *patch.ProductName
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

	// No existence pre-check — the read-back below already reports a missing row.
	if err := repositary.UpdateProofFields(id, fields); err != nil {
		return nil, err
	}

	updated, err := repositary.FindProof(id)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, ErrProofNotFound
	}
	res := dto.NewProofResponse(*updated)
	return &res, nil
}

// DeleteProof drops the stored image along with the row, otherwise the uploads
// table keeps growing.
func DeleteProof(id uint) error {
	existing, err := repositary.FindProof(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrProofNotFound
	}
	if _, err := repositary.DeleteProof(id); err != nil {
		return err
	}
	if err := RemoveUpload(existing.ImageURL); err != nil {
		log.Printf("proof %d deleted but its image %q could not be removed: %v", id, existing.ImageURL, err)
	}
	return nil
}

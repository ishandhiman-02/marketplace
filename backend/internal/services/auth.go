package services

import (
	"strings"

	"imagine_backend/internal/apperror"
	"imagine_backend/internal/dto"
	"imagine_backend/internal/model"
	"imagine_backend/internal/repositary"
	"imagine_backend/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

// ErrInvalidCredentials is deliberately returned for both an unknown email and a
// wrong password — telling them apart would let an attacker enumerate accounts.
var ErrInvalidCredentials = apperror.ErrUnauthorized.With("Incorrect email or password.")

var ErrMissingCredentials = apperror.BadRequest.With("Both email and password are required")

func Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	if req.Email == "" || req.Password == "" {
		return nil, ErrMissingCredentials
	}

	user, err := repositary.FindAdminByEmail(strings.ToLower(strings.TrimSpace(req.Email)))
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		return nil, ErrInvalidCredentials
	}

	token, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		return nil, err
	}
	return &dto.LoginResponse{
		Token: token,
		User:  dto.UserResponse{ID: user.ID, Email: user.Email},
	}, nil
}

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(hash), err
}

// EnsureAdmin creates an admin account only when the table is empty, so it is safe
// to call on every migration run.
func EnsureAdmin(email, password string) (bool, error) {
	n, err := repositary.CountAdmins()
	if err != nil || n > 0 {
		return false, err
	}
	hash, err := HashPassword(password)
	if err != nil {
		return false, err
	}
	user := model.AdminUser{Email: strings.ToLower(strings.TrimSpace(email)), PasswordHash: hash}
	if err := repositary.CreateAdmin(&user); err != nil {
		return false, err
	}
	return true, nil
}

// AdminSpec is one account the deployment wants to exist.
type AdminSpec struct {
	Email    string
	Password string
}

// EnsureAdmins makes the admin accounts match what the environment asks for,
// keyed on email: missing ones are created, and an existing one whose password
// no longer matches is updated.
//
// Updating is deliberate. There is no change-password screen anywhere in the
// product, so the deploy environment is the only place an admin password can
// come from — which makes it the source of truth. Without this, a leaked or
// mistyped password could never be rotated without hand-editing the database.
//
// The cost is that whatever is in the environment wins on every deploy. Remove an
// account from ADMIN_ACCOUNTS before changing it by any other means.
//
// Deleted accounts are NOT resurrected unless they are still listed. Returns the
// emails created and updated, so the caller can log them without ever logging a
// password.
func EnsureAdmins(specs []AdminSpec) (created []string, updated []string, err error) {
	for _, spec := range specs {
		email := strings.ToLower(strings.TrimSpace(spec.Email))
		if email == "" || spec.Password == "" {
			continue
		}

		existing, err := repositary.FindAdminByEmail(email)
		if err != nil {
			return created, updated, err
		}

		if existing != nil {
			// Already correct — leave the row (and its hash) untouched, so a
			// redeploy is a no-op rather than a pointless write.
			if bcrypt.CompareHashAndPassword([]byte(existing.PasswordHash), []byte(spec.Password)) == nil {
				continue
			}
			hash, err := HashPassword(spec.Password)
			if err != nil {
				return created, updated, err
			}
			if err := repositary.UpdateAdminPassword(existing.ID, hash); err != nil {
				return created, updated, err
			}
			updated = append(updated, email)
			continue
		}

		hash, err := HashPassword(spec.Password)
		if err != nil {
			return created, updated, err
		}
		if err := repositary.CreateAdmin(&model.AdminUser{Email: email, PasswordHash: hash}); err != nil {
			return created, updated, err
		}
		created = append(created, email)
	}

	return created, updated, nil
}

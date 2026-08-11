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

// EnsureAdmins creates each account that does not exist yet, keyed on email.
//
// Existing accounts are left strictly alone: a redeploy must never reset a
// password someone has since changed, and it must never silently re-enable an
// account that was removed on purpose. Keying on email rather than on "is the
// table empty" is what lets a second admin be added to a live site.
//
// Returns the emails actually created, so the caller can log them without ever
// logging the passwords.
func EnsureAdmins(specs []AdminSpec) ([]string, error) {
	created := make([]string, 0, len(specs))

	for _, spec := range specs {
		email := strings.ToLower(strings.TrimSpace(spec.Email))
		if email == "" || spec.Password == "" {
			continue
		}

		existing, err := repositary.FindAdminByEmail(email)
		if err != nil {
			return created, err
		}
		if existing != nil {
			continue
		}

		hash, err := HashPassword(spec.Password)
		if err != nil {
			return created, err
		}
		if err := repositary.CreateAdmin(&model.AdminUser{Email: email, PasswordHash: hash}); err != nil {
			return created, err
		}
		created = append(created, email)
	}

	return created, nil
}

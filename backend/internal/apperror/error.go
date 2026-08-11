package apperror

import "net/http"

// AppError is an error that carries the HTTP status and the user-facing message
// it should produce.
//
// Sentinels declare their own status here so the handler layer can stay generic:
// it renders whatever it is handed instead of keeping a switch listing every
// error in the system. A sentinel added to a service is reported correctly
// without touching any shared file.
type AppError struct {
	Message    string
	Code       string
	HTTPStatus int
}

func (e AppError) Error() string { return e.Message }

// With returns a copy carrying a specific message, so each entity names its own
// failure without restating the status:
//
//	var ErrProductNotFound = apperror.NotFound.With("Product not found")
func (e AppError) With(message string) AppError {
	e.Message = message
	return e
}

var ErrUnauthorized = AppError{
	Code:       "UNAUTHORIZED",
	Message:    "Unauthorized access",
	HTTPStatus: http.StatusUnauthorized,
}

var MethodNotAllowed = AppError{
	Code:       "METHOD_NOT_ALLOWED",
	Message:    "Method not allowed",
	HTTPStatus: http.StatusMethodNotAllowed,
}

var BadRequest = AppError{
	Code:       "BAD_REQUEST",
	Message:    "Bad request",
	HTTPStatus: http.StatusBadRequest,
}

var NotFound = AppError{
	Code:       "NOT_FOUND",
	Message:    "Resource not found",
	HTTPStatus: http.StatusNotFound,
}

var InternalServerError = AppError{
	Code:       "INTERNAL_SERVER_ERROR",
	Message:    "Internal server error",
	HTTPStatus: http.StatusInternalServerError,
}

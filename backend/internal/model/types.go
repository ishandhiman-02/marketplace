package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
)

// JSONB carries a raw jsonb document straight through from Postgres to the API.
// Product variants and the site-settings blob are both admin-defined shapes that
// the backend deliberately does not pin down, so decoding them into a Go struct
// would only throw information away.
type JSONB json.RawMessage

func (j JSONB) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	if !json.Valid(j) {
		return nil, errors.New("jsonb: refusing to store invalid JSON")
	}
	return []byte(j), nil
}

func (j *JSONB) Scan(src any) error {
	switch v := src.(type) {
	case nil:
		*j = nil
	case []byte:
		*j = append((*j)[:0], v...)
	case string:
		*j = JSONB(v)
	default:
		return fmt.Errorf("jsonb: cannot scan %T", src)
	}
	return nil
}

func (j JSONB) MarshalJSON() ([]byte, error) {
	if len(j) == 0 {
		return []byte("null"), nil
	}
	return j, nil
}

func (j *JSONB) UnmarshalJSON(b []byte) error {
	*j = append((*j)[:0], b...)
	return nil
}

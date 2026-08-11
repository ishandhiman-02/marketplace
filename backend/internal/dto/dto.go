package dto

// mapSlice converts a slice of models into a slice of responses.
//
// It always returns a non-nil slice, which matters: `[]` and `null` are different
// answers to "list the products", and the frontend maps over the result.
func mapSlice[T, R any](in []T, convert func(T) R) []R {
	out := make([]R, 0, len(in))
	for _, v := range in {
		out = append(out, convert(v))
	}
	return out
}

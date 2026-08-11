package services

import (
	"imagine_backend/internal/repositary"
	"imagine_backend/internal/seed"
)

// SeedCatalog gives a brand-new deployment something to sell.
//
// Each half is guarded by its own row count, so running it on every deploy is
// safe: as soon as there is a single product it never touches them again.
//
// The guard is "empty", not "never seeded" — so an admin who deletes every last
// product will find them back after the next deploy. That is the deliberate
// trade: it also means an already-deployed shop that migrated before this
// existed gets its catalogue on the next deploy, which is the case that matters.
// To retire a product without it returning, set it inactive instead of deleting.
//
// Returns how many of each were inserted, for the migration log.
func SeedCatalog() (products int, offers int, err error) {
	catalogProducts, catalogOffers, err := seed.Catalog()
	if err != nil {
		return 0, 0, err
	}

	n, err := repositary.CountProducts()
	if err != nil {
		return 0, 0, err
	}
	if n == 0 {
		if err := repositary.CreateProducts(catalogProducts); err != nil {
			return 0, 0, err
		}
		products = len(catalogProducts)
	}

	n, err = repositary.CountOffers()
	if err != nil {
		return products, 0, err
	}
	if n == 0 {
		if err := repositary.CreateOffers(catalogOffers); err != nil {
			return products, 0, err
		}
		offers = len(catalogOffers)
	}

	return products, offers, nil
}

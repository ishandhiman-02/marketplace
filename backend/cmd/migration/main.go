package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"strings"

	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/model"
	"imagine_backend/internal/repositary"
	"imagine_backend/internal/services"
)

func main() {
	config.LoadConfig()
	db.ConnectToDB()
	sqlDB, err := db.DB.DB()
	if err != nil {
		log.Fatalf("Failed to get SQL DB: %v", err)
	}
	defer func() {
		if err := sqlDB.Close(); err != nil {
			log.Printf("Error closing DB: %v", err)
		}
	}()

	log.Printf("Connected to database: %v", db.DB.Dialector.Name())

	// Multi-tenant by Postgres schema: every project shares one DB and gets its own
	// DB_SCHEMA. The schema must exist and be on the search_path before AutoMigrate,
	// or the tables land in the wrong place (or nowhere).
	schema := config.AppConfig.DBSchema
	if schema == "" {
		log.Fatalf("DB_SCHEMA is required but empty — cannot migrate without a target schema")
	}
	if err := db.DB.Exec(fmt.Sprintf(`CREATE SCHEMA IF NOT EXISTS "%s"`, schema)).Error; err != nil {
		log.Fatalf("create schema %q: %v", schema, err)
	}
	if err := db.DB.Exec(fmt.Sprintf(`SET search_path TO "%s"`, schema)).Error; err != nil {
		log.Fatalf("set search_path %q: %v", schema, err)
	}

	log.Printf("Running migrations in schema %q...", schema)
	if err := db.DB.AutoMigrate(
		&model.AdminUser{},
		&model.Product{},
		&model.DailyOffer{},
		&model.Proof{},
		&model.Lead{},
		&model.SiteSetting{},
		&model.Upload{},
	); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("All models migrated successfully")

	seedSettings()
	seedCatalog()
	bootstrapAdmin()
}

// seedSettings creates the single settings row. An empty document means "everything
// as shipped" — the frontend merges it over its own defaults.
func seedSettings() {
	existing, err := repositary.GetSettings()
	if err != nil {
		log.Printf("WARNING: could not check site_settings: %v", err)
		return
	}
	if existing != nil {
		return
	}
	if _, err := repositary.SaveSettings(model.JSONB("{}")); err != nil {
		log.Printf("WARNING: could not seed site_settings: %v", err)
		return
	}
	log.Println("Seeded the site_settings row.")
}

// seedCatalog fills an empty shop with the starter catalogue. Without it a fresh
// deploy serves `[]`, the storefront swaps its bundled fallback for nothing, and
// the hero cards appear for one frame and then disappear.
//
// Not fatal: a shop with no products is still a working site, and crash-looping
// the container over seed data would take the whole deploy down.
func seedCatalog() {
	products, offers, err := services.SeedCatalog()
	if err != nil {
		log.Printf("WARNING: could not seed the catalogue: %v", err)
		return
	}
	if products == 0 && offers == 0 {
		return
	}
	log.Printf("Seeded the starter catalogue: %d product(s), %d offer(s).", products, offers)
}

// bootstrapAdmin makes sure the deployment has someone who can sign in. There is
// no public signup anywhere, and the deploy has no way to run an interactive
// script, so accounts have to arrive through the environment.
//
// Accounts listed in ADMIN_ACCOUNTS (or ADMIN_EMAIL/ADMIN_PASSWORD) are created
// when missing and have their password brought back in line when it differs —
// the environment is the only place a password can be set, so it is the source
// of truth. With nothing configured, a single account with a random password is
// created and printed once, so a fresh deploy is never locked out.
func bootstrapAdmin() {
	// Configured accounts win. Each is created only if that email is absent, so
	// this is safe on every deploy and can add a colleague to a live site.
	if specs := configuredAdmins(); len(specs) > 0 {
		created, updated, err := services.EnsureAdmins(specs)
		if err != nil {
			log.Printf("WARNING: could not apply the configured admin accounts: %v", err)
			return
		}
		// Emails only — the passwords came from the environment and must not be
		// copied into a log that many people can read.
		if len(created) > 0 {
			log.Printf("Created %d admin account(s): %s", len(created), strings.Join(created, ", "))
		}
		if len(updated) > 0 {
			log.Printf("Updated the password for %d admin account(s): %s", len(updated), strings.Join(updated, ", "))
		}
		if len(created) == 0 && len(updated) == 0 {
			log.Printf("Admin accounts already match the environment; nothing to do.")
		}
		return
	}

	// Nothing configured: fall back to one generated account so a fresh deploy is
	// reachable at all. Only while the table is empty.
	buf := make([]byte, 12)
	if _, err := rand.Read(buf); err != nil {
		log.Printf("WARNING: could not generate an admin password: %v", err)
		return
	}
	password := hex.EncodeToString(buf)

	created, err := services.EnsureAdmin("admin@substore.local", password)
	if err != nil {
		log.Printf("WARNING: could not bootstrap the admin account: %v", err)
		return
	}
	if !created {
		return
	}
	log.Printf("Created the first admin account: admin@substore.local / %s", password)
	log.Printf("This password is shown ONCE. Save it now.")
}

// configuredAdmins reads the accounts the deployment wants to exist.
//
//	ADMIN_ACCOUNTS=a@x.com:secret1,b@y.com:secret2   (comma or newline separated)
//	ADMIN_EMAIL / ADMIN_PASSWORD                     (single account, still honoured)
//
// Credentials come from the environment and never from the repository, which is
// public. Email and password split on the FIRST colon, so a password may contain
// colons — but not commas or newlines, which separate entries.
func configuredAdmins() []services.AdminSpec {
	var specs []services.AdminSpec

	for _, entry := range strings.FieldsFunc(os.Getenv("ADMIN_ACCOUNTS"), func(r rune) bool {
		return r == ',' || r == '\n' || r == '\r'
	}) {
		email, password, found := strings.Cut(strings.TrimSpace(entry), ":")
		if !found {
			log.Printf("WARNING: ignoring ADMIN_ACCOUNTS entry with no ':' separator")
			continue
		}
		specs = append(specs, services.AdminSpec{Email: email, Password: password})
	}

	if email, password := os.Getenv("ADMIN_EMAIL"), os.Getenv("ADMIN_PASSWORD"); email != "" && password != "" {
		specs = append(specs, services.AdminSpec{Email: email, Password: password})
	}

	return specs
}

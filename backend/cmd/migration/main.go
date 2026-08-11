package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"os"

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

// bootstrapAdmin creates the first admin account, because there is no public signup
// anywhere and the deploy has no way to run an interactive script.
//
// ADMIN_EMAIL / ADMIN_PASSWORD are honoured when present. When they are absent — the
// normal case, since the deploy grants only the 9 standard vars — a random password
// is generated and printed ONCE to the deploy log. Runs only while the table is
// empty, so it is safe on every boot and never overwrites a changed password.
func bootstrapAdmin() {
	email := os.Getenv("ADMIN_EMAIL")
	if email == "" {
		email = "admin@substore.local"
	}
	password := os.Getenv("ADMIN_PASSWORD")
	generated := false
	if password == "" {
		buf := make([]byte, 12)
		if _, err := rand.Read(buf); err != nil {
			log.Printf("WARNING: could not generate an admin password: %v", err)
			return
		}
		password = hex.EncodeToString(buf)
		generated = true
	}

	created, err := services.EnsureAdmin(email, password)
	if err != nil {
		log.Printf("WARNING: could not bootstrap the admin account: %v", err)
		return
	}
	if !created {
		return
	}
	if generated {
		log.Printf("Created the first admin account: %s / %s", email, password)
		log.Printf("This password is shown ONCE. Save it now, then change it.")
		return
	}
	log.Printf("Created the first admin account: %s (password from ADMIN_PASSWORD)", email)
}

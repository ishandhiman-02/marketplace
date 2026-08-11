package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port       string
	Env        string
	DBUser     string
	DBPassword string
	DBName     string
	DBHost     string
	DBPort     string
	DBSchema   string
	JWTSecret  string
}

var AppConfig *Config

func LoadConfig() {
	godotenv.Load()

	// A per-environment file may override the base one. Missing is fine — the
	// deploy supplies everything through real environment variables.
	if env := os.Getenv("ENV"); env != "" {
		godotenv.Overload(".env." + env)
	}

	AppConfig = &Config{
		Port:       os.Getenv("PORT"),
		Env:        os.Getenv("ENV"),
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBSchema:   os.Getenv("DB_SCHEMA"),
		JWTSecret:  os.Getenv("JWT_SECRET"),
	}
	// JWT_SECRET is platform-wide and supplied by the deploy environment. Never bake
	// a fallback secret in — a shipped default is a forgeable-token vulnerability.
	// Fail soft (warn, keep booting) so a missing value can't crash-loop into a 502.
	if AppConfig.JWTSecret == "" {
		log.Println("WARNING: JWT_SECRET is not set — token signing and validation will fail")
	}
	if AppConfig.Port == "" {
		AppConfig.Port = "8080"
	}
}

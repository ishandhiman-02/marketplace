package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"imagine_backend/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectToDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Kolkata",
		config.AppConfig.DBHost, config.AppConfig.DBUser, config.AppConfig.DBPassword, config.AppConfig.DBName, config.AppConfig.DBPort,
	)
	// Only pin search_path when DB_SCHEMA is actually set — an empty `search_path=`
	// in the DSN is rejected by the driver and would crash-loop the container.
	if schema := config.AppConfig.DBSchema; schema != "" {
		dsn += " search_path=" + schema
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		// Every write in this service is a single statement. GORM's default
		// wrapper would turn each one into BEGIN/…/COMMIT — three round-trips
		// where one will do. The one place that needs atomicity batches instead.
		SkipDefaultTransaction: true,
		Logger: gormlogger.New(
			log.New(os.Stdout, "", log.LstdFlags),
			gormlogger.Config{
				SlowThreshold: 200 * time.Millisecond,
				LogLevel:      gormlogger.Warn,
				// A missing row is an ordinary answer here — the repositary turns
				// it into (nil, nil) so callers can return a 404. Logging it as an
				// error would print a stack-looking warning on every such lookup.
				IgnoreRecordNotFoundError: true,
				// Deploy logs are captured, not a terminal; ANSI codes only add noise.
				Colorful: false,
			},
		),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Without this Go keeps only 2 idle connections, so past two concurrent
	// requests every query pays a fresh TCP + auth handshake to Postgres.
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to access the underlying database handle: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetConnMaxLifetime(time.Hour)
}

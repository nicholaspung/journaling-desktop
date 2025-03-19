// backend/database/db.go
package database

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

// Initialize initializes the database connection and creates tables if they don't exist
func Initialize(dbPath string) error {
	var err error
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		return err
	}

	// Create questions table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS questions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content TEXT NOT NULL,
		used_on DATE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		return err
	}

	// Create answers table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS answers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		question_id INTEGER NOT NULL,
		content TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (question_id) REFERENCES questions(id)
	)`)
	if err != nil {
		return err
	}

	// Create affirmations table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS affirmations (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		return err
	}

	// Create affirmation logs table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS affirmation_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		affirmation_id INTEGER NOT NULL,
		completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (affirmation_id) REFERENCES affirmations(id)
	)`)
	if err != nil {
		return err
	}

	// Create gratitude items table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS gratitude_items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content TEXT NOT NULL,
		entry_date TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`)

	// Create creativity entries table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS creativity_entries (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content TEXT NOT NULL,
		entry_date TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		return err
	}

	return err
}

// Close closes the database connection
func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

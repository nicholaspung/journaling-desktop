// backend/models/affirmation.go
package models

import (
	"time"

	"myproject/backend/database"
)

type Affirmation struct {
	ID        int64     `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// GetActiveAffirmation gets the most recently created affirmation
func GetActiveAffirmation() (*Affirmation, error) {
	var affirmation Affirmation

	err := database.DB.QueryRow(`
		SELECT id, content, created_at, updated_at 
		FROM affirmations 
		ORDER BY created_at DESC 
		LIMIT 1`).Scan(
		&affirmation.ID, &affirmation.Content, &affirmation.CreatedAt, &affirmation.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &affirmation, nil
}

// SaveAffirmation creates or updates the active affirmation
func SaveAffirmation(content string) (*Affirmation, error) {
	now := time.Now()

	// We'll create a new affirmation record each time
	res, err := database.DB.Exec(`
		INSERT INTO affirmations (content, created_at, updated_at) 
		VALUES (?, ?, ?)`, content, now, now)

	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &Affirmation{
		ID:        id,
		Content:   content,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// LogAffirmationCompletion records that the user completed their affirmation
func LogAffirmationCompletion(affirmationID int64) error {
	_, err := database.DB.Exec(`
		INSERT INTO affirmation_logs (affirmation_id) 
		VALUES (?)`, affirmationID)

	return err
}

// CheckTodayAffirmation checks if the affirmation was completed today
func CheckTodayAffirmation(affirmationID int64) (bool, error) {
	var count int
	today := time.Now().Format("2006-01-02")

	err := database.DB.QueryRow(`
		SELECT COUNT(*) 
		FROM affirmation_logs 
		WHERE affirmation_id = ? 
		AND date(completed_at) = ?`, affirmationID, today).Scan(&count)

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetAffirmationStreak returns the current streak of consecutive days
func GetAffirmationStreak() (int, error) {
	// This is a simplified version - a more robust implementation would
	// handle gaps in the streak better
	var streak int

	rows, err := database.DB.Query(`
		SELECT date(completed_at) as log_date
		FROM affirmation_logs
		GROUP BY log_date
		ORDER BY log_date DESC`)

	if err != nil {
		return 0, err
	}
	defer rows.Close()

	var dates []string
	for rows.Next() {
		var date string
		err := rows.Scan(&date)
		if err != nil {
			return 0, err
		}
		dates = append(dates, date)
	}

	// Count consecutive days
	if len(dates) == 0 {
		return 0, nil
	}

	streak = 1
	today := time.Now()

	for i := 0; i < len(dates); i++ {
		logDate, err := time.Parse("2006-01-02", dates[i])
		if err != nil {
			return 0, err
		}

		expectedDate := today.AddDate(0, 0, -i)
		expectedDateStr := expectedDate.Format("2006-01-02")

		if logDate.Format("2006-01-02") == expectedDateStr {
			if i > 0 {
				streak++
			}
		} else {
			break
		}
	}

	return streak, nil
}

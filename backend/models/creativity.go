// backend/models/creativity.go
package models

import (
	"time"

	"myproject/backend/database"
)

type CreativityEntry struct {
	ID        int64     `json:"id"`
	Content   string    `json:"content"`
	EntryDate string    `json:"entryDate"` // Store the date in YYYY-MM-DD format
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// SaveCreativityEntry creates or updates a creativity journal entry for a specific date
func SaveCreativityEntry(content string, entryDate string) (*CreativityEntry, error) {
	// Check if an entry already exists for this date
	var existingID int64
	var existingCount int

	err := database.DB.QueryRow(`
		SELECT COUNT(*), id FROM creativity_entries 
		WHERE entry_date = ? 
		LIMIT 1`, entryDate).Scan(&existingCount, &existingID)

	now := time.Now()

	if err != nil || existingCount == 0 {
		// Create a new entry
		res, err := database.DB.Exec(`
			INSERT INTO creativity_entries (content, entry_date, created_at, updated_at) 
			VALUES (?, ?, ?, ?)`, content, entryDate, now, now)

		if err != nil {
			return nil, err
		}

		id, err := res.LastInsertId()
		if err != nil {
			return nil, err
		}

		return &CreativityEntry{
			ID:        id,
			Content:   content,
			EntryDate: entryDate,
			CreatedAt: now,
			UpdatedAt: now,
		}, nil
	} else {
		// Update existing entry
		_, err := database.DB.Exec(`
			UPDATE creativity_entries 
			SET content = ?, updated_at = ? 
			WHERE id = ?`, content, now, existingID)

		if err != nil {
			return nil, err
		}

		return &CreativityEntry{
			ID:        existingID,
			Content:   content,
			EntryDate: entryDate,
			CreatedAt: now, // This will be overwritten below
			UpdatedAt: now,
		}, nil
	}
}

// GetCreativityEntryByDate retrieves the creativity entry for a specific date
func GetCreativityEntryByDate(entryDate string) (*CreativityEntry, error) {
	var entry CreativityEntry

	err := database.DB.QueryRow(`
		SELECT id, content, entry_date, created_at, updated_at 
		FROM creativity_entries 
		WHERE entry_date = ?`, entryDate).Scan(
		&entry.ID, &entry.Content, &entry.EntryDate, &entry.CreatedAt, &entry.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &entry, nil
}

// GetAllCreativityEntries retrieves all creativity entries
func GetAllCreativityEntries() ([]CreativityEntry, error) {
	rows, err := database.DB.Query(`
		SELECT id, content, entry_date, created_at, updated_at 
		FROM creativity_entries 
		ORDER BY entry_date DESC`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []CreativityEntry
	for rows.Next() {
		var entry CreativityEntry
		err := rows.Scan(&entry.ID, &entry.Content, &entry.EntryDate, &entry.CreatedAt, &entry.UpdatedAt)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	return entries, nil
}

// UpdateCreativityEntry updates a creativity entry
func UpdateCreativityEntry(id int64, content string) error {
	now := time.Now()
	_, err := database.DB.Exec(`
		UPDATE creativity_entries 
		SET content = ?, updated_at = ? 
		WHERE id = ?`, content, now, id)
	return err
}

// DeleteCreativityEntry deletes a creativity entry
func DeleteCreativityEntry(id int64) error {
	_, err := database.DB.Exec(`DELETE FROM creativity_entries WHERE id = ?`, id)
	return err
}

// HasCreativityEntryForDate checks if there is an entry for the given date
func HasCreativityEntryForDate(entryDate string) (bool, error) {
	var count int
	err := database.DB.QueryRow(`
		SELECT COUNT(*) 
		FROM creativity_entries 
		WHERE entry_date = ?`, entryDate).Scan(&count)

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetCreativityStreak calculates the current streak of consecutive days with creativity entries
func GetCreativityStreak() (int, error) {
	rows, err := database.DB.Query(`
		SELECT DISTINCT entry_date
		FROM creativity_entries
		ORDER BY entry_date DESC`)

	if err != nil {
		return 0, err
	}
	defer rows.Close()

	var dates []string
	for rows.Next() {
		var date string
		if err := rows.Scan(&date); err != nil {
			return 0, err
		}
		dates = append(dates, date)
	}

	if len(dates) == 0 {
		return 0, nil
	}

	// Parse the first date (most recent date)
	latestDate, err := time.Parse("2006-01-02", dates[0])
	if err != nil {
		return 0, err
	}

	today := time.Now()
	todayStr := today.Format("2006-01-02")
	yesterdayStr := today.AddDate(0, 0, -1).Format("2006-01-02")

	// Check if the latest entry is from today or yesterday to start the streak
	if dates[0] != todayStr && dates[0] != yesterdayStr {
		// The latest entry is older than yesterday, so no active streak
		return 0, nil
	}

	// Initialize streak counter
	streak := 1

	// Check for consecutive days
	for i := 1; i < len(dates); i++ {
		currentDate, err := time.Parse("2006-01-02", dates[i])
		if err != nil {
			return 0, err
		}

		// Check if this date is consecutive with the previous one
		expectedDate := latestDate.AddDate(0, 0, -i)
		expectedDateStr := expectedDate.Format("2006-01-02")

		if currentDate.Format("2006-01-02") == expectedDateStr {
			streak++
		} else {
			// Chain broken, end the streak count
			break
		}
	}

	return streak, nil
}

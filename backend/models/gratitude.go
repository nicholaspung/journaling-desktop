// backend/models/gratitude.go
package models

import (
	"errors"
	"time"

	"myproject/backend/database"
)

type GratitudeItem struct {
	ID        int64     `json:"id"`
	Content   string    `json:"content"`
	EntryDate string    `json:"entryDate"` // Store the date in YYYY-MM-DD format
	CreatedAt time.Time `json:"createdAt"`
}

type GratitudeEntry struct {
	Date  string          `json:"date"`
	Items []GratitudeItem `json:"items"`
}

// Initialize the gratitude table in the database
func InitGratitudeTable() error {
	_, err := database.DB.Exec(`
	CREATE TABLE IF NOT EXISTS gratitude_items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content TEXT NOT NULL,
		entry_date TEXT NOT NULL, 
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`)

	return err
}

// AddGratitudeItem adds a new gratitude item for today
func AddGratitudeItem(content string) (*GratitudeItem, error) {
	// Get today's date in YYYY-MM-DD format
	today := time.Now().Format("2006-01-02")

	// Check how many entries we already have for today
	var count int
	err := database.DB.QueryRow(`
		SELECT COUNT(*) FROM gratitude_items 
		WHERE entry_date = ?`, today).Scan(&count)

	if err != nil {
		return nil, err
	}

	// Limit to 5 entries per day
	if count >= 5 {
		return nil, errors.New("maximum number of gratitude entries for today reached (5)")
	}

	// Insert the new gratitude item
	res, err := database.DB.Exec(`
		INSERT INTO gratitude_items (content, entry_date) 
		VALUES (?, ?)`, content, today)

	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &GratitudeItem{
		ID:        id,
		Content:   content,
		EntryDate: today,
		CreatedAt: time.Now(),
	}, nil
}

// GetTodayGratitudeItems gets all gratitude items for today
func GetTodayGratitudeItems() ([]GratitudeItem, error) {
	today := time.Now().Format("2006-01-02")
	return GetGratitudeItemsByDate(today)
}

// GetGratitudeItemsByDate gets all gratitude items for a specific date
func GetGratitudeItemsByDate(date string) ([]GratitudeItem, error) {
	rows, err := database.DB.Query(`
		SELECT id, content, entry_date, created_at 
		FROM gratitude_items 
		WHERE entry_date = ? 
		ORDER BY created_at ASC`, date)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []GratitudeItem
	for rows.Next() {
		var item GratitudeItem
		err := rows.Scan(&item.ID, &item.Content, &item.EntryDate, &item.CreatedAt)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

// HasTodayGratitudeEntries checks if there are any entries for today
func HasTodayGratitudeEntries() (bool, error) {
	today := time.Now().Format("2006-01-02")

	var count int
	err := database.DB.QueryRow(`
		SELECT COUNT(*) FROM gratitude_items 
		WHERE entry_date = ?`, today).Scan(&count)

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// CountTodayGratitudeEntries counts the number of entries for today
func CountTodayGratitudeEntries() (int, error) {
	today := time.Now().Format("2006-01-02")

	var count int
	err := database.DB.QueryRow(`
		SELECT COUNT(*) FROM gratitude_items 
		WHERE entry_date = ?`, today).Scan(&count)

	if err != nil {
		return 0, err
	}

	return count, nil
}

// GetAllGratitudeEntries gets all gratitude entries grouped by date
func GetAllGratitudeEntries() ([]GratitudeEntry, error) {
	// First, get distinct dates
	rows, err := database.DB.Query(`
		SELECT DISTINCT entry_date 
		FROM gratitude_items 
		ORDER BY entry_date DESC`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dates []string
	for rows.Next() {
		var date string
		if err := rows.Scan(&date); err != nil {
			return nil, err
		}
		dates = append(dates, date)
	}

	// Now get items for each date
	var entries []GratitudeEntry
	for _, date := range dates {
		items, err := GetGratitudeItemsByDate(date)
		if err != nil {
			return nil, err
		}

		entries = append(entries, GratitudeEntry{
			Date:  date,
			Items: items,
		})
	}

	return entries, nil
}

// UpdateGratitudeItem updates a gratitude item
func UpdateGratitudeItem(id int64, content string) error {
	_, err := database.DB.Exec(`
		UPDATE gratitude_items 
		SET content = ? 
		WHERE id = ?`, content, id)

	return err
}

// DeleteGratitudeItem deletes a gratitude item
func DeleteGratitudeItem(id int64) error {
	_, err := database.DB.Exec(`
		DELETE FROM gratitude_items 
		WHERE id = ?`, id)

	return err
}

// GetLastNDaysWithGratitude gets entries for the last n days
func GetLastNDaysWithGratitude(n int) ([]GratitudeEntry, error) {
	// Get the last n distinct dates with entries
	rows, err := database.DB.Query(`
		SELECT DISTINCT entry_date 
		FROM gratitude_items 
		ORDER BY entry_date DESC 
		LIMIT ?`, n)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dates []string
	for rows.Next() {
		var date string
		if err := rows.Scan(&date); err != nil {
			return nil, err
		}
		dates = append(dates, date)
	}

	// Now get items for each date
	var entries []GratitudeEntry
	for _, date := range dates {
		items, err := GetGratitudeItemsByDate(date)
		if err != nil {
			return nil, err
		}

		entries = append(entries, GratitudeEntry{
			Date:  date,
			Items: items,
		})
	}

	return entries, nil
}

// GetGratitudeStreak calculates the current streak of consecutive days with gratitude entries
func GetGratitudeStreak() (int, error) {
	rows, err := database.DB.Query(`
		SELECT DISTINCT entry_date
		FROM gratitude_items
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

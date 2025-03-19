// backend/models/affirmation_test.go
package models

import (
	"myproject/backend/database"
	"os"
	"testing"
	"time"
)

func TestAffirmationModel(t *testing.T) {
	// Set up test database
	testDB := "./test.db"

	// Clean up any existing test database
	os.Remove(testDB)

	// Initialize test database
	err := database.Initialize(testDB)
	if err != nil {
		t.Fatalf("Failed to initialize test database: %v", err)
	}

	// Clean up after test
	defer func() {
		database.Close()
		os.Remove(testDB)
	}()

	// Test SaveAffirmation
	t.Run("SaveAffirmation", func(t *testing.T) {
		content := "I am capable of achieving my goals"
		affirmation, err := SaveAffirmation(content)

		if err != nil {
			t.Fatalf("Failed to save affirmation: %v", err)
		}

		if affirmation.ID <= 0 {
			t.Errorf("Expected valid ID, got %d", affirmation.ID)
		}

		if affirmation.Content != content {
			t.Errorf("Expected content '%s', got '%s'", content, affirmation.Content)
		}
	})

	// Test GetActiveAffirmation
	t.Run("GetActiveAffirmation", func(t *testing.T) {
		expectedContent := "I am worthy of love and respect"
		_, err := SaveAffirmation(expectedContent)
		if err != nil {
			t.Fatalf("Failed to save affirmation: %v", err)
		}

		affirmation, err := GetActiveAffirmation()
		if err != nil {
			t.Fatalf("Failed to get active affirmation: %v", err)
		}

		if affirmation.Content != expectedContent {
			t.Errorf("Expected content '%s', got '%s'", expectedContent, affirmation.Content)
		}
	})

	// Test LogAffirmationCompletion and CheckTodayAffirmation
	t.Run("AffirmationLogging", func(t *testing.T) {
		affirmation, err := SaveAffirmation("Test affirmation")
		if err != nil {
			t.Fatalf("Failed to save affirmation: %v", err)
		}

		// Check before logging
		completed, err := CheckTodayAffirmation(affirmation.ID)
		if err != nil {
			t.Fatalf("Failed to check today's affirmation: %v", err)
		}

		if completed {
			t.Errorf("Expected affirmation to not be completed yet")
		}

		// Log completion
		err = LogAffirmationCompletion(affirmation.ID)
		if err != nil {
			t.Fatalf("Failed to log affirmation completion: %v", err)
		}

		// Check after logging
		completed, err = CheckTodayAffirmation(affirmation.ID)
		if err != nil {
			t.Fatalf("Failed to check today's affirmation: %v", err)
		}

		if !completed {
			t.Errorf("Expected affirmation to be completed")
		}
	})

	// Test GetAffirmationStreak
	t.Run("GetAffirmationStreak", func(t *testing.T) {
		// Reset DB for this test
		database.Close()
		os.Remove(testDB)
		database.Initialize(testDB)

		affirmation, err := SaveAffirmation("Streak test")
		if err != nil {
			t.Fatalf("Failed to save affirmation: %v", err)
		}

		// Log today
		err = LogAffirmationCompletion(affirmation.ID)
		if err != nil {
			t.Fatalf("Failed to log affirmation: %v", err)
		}

		// Insert a record for yesterday manually
		yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
		_, err = database.DB.Exec(`
			INSERT INTO affirmation_logs (affirmation_id, completed_at) 
			VALUES (?, ?)`, affirmation.ID, yesterday)
		if err != nil {
			t.Fatalf("Failed to insert yesterday's log: %v", err)
		}

		streak, err := GetAffirmationStreak()
		if err != nil {
			t.Fatalf("Failed to get streak: %v", err)
		}

		if streak != 2 {
			t.Errorf("Expected streak of 2, got %d", streak)
		}
	})

	// Test CRUD operations
	t.Run("AffirmationCRUD", func(t *testing.T) {
		// Create
		content := "Original affirmation"
		affirmation, err := SaveAffirmation(content)
		if err != nil {
			t.Fatalf("Failed to save affirmation: %v", err)
		}

		// Update
		newContent := "Updated affirmation"
		err = UpdateAffirmation(affirmation.ID, newContent)
		if err != nil {
			t.Fatalf("Failed to update affirmation: %v", err)
		}

		// Get to verify update
		affirmations, err := GetAllAffirmations()
		if err != nil {
			t.Fatalf("Failed to get affirmations: %v", err)
		}

		found := false
		for _, a := range affirmations {
			if a.ID == affirmation.ID {
				if a.Content != newContent {
					t.Errorf("Expected updated content '%s', got '%s'", newContent, a.Content)
				}
				found = true
				break
			}
		}

		if !found {
			t.Errorf("Failed to find updated affirmation")
		}

		// Delete
		err = DeleteAffirmation(affirmation.ID)
		if err != nil {
			t.Fatalf("Failed to delete affirmation: %v", err)
		}

		// Verify deletion
		affirmations, err = GetAllAffirmations()
		if err != nil {
			t.Fatalf("Failed to get affirmations: %v", err)
		}

		for _, a := range affirmations {
			if a.ID == affirmation.ID {
				t.Errorf("Affirmation still exists after deletion")
				break
			}
		}
	})
}

// backend/api_test.go
package backend

import (
	"context"
	"os"
	"testing"

	"myproject/backend/models"
)

func TestAppIntegration(t *testing.T) {
	// Test database path
	testDB := "./api_test.db"

	// Clean up existing test database
	os.Remove(testDB)

	// Create test app with context
	app := NewApp()
	ctx := context.Background()

	// Start the app with the test database
	t.Setenv("DB_PATH", testDB)
	app.Startup(ctx)

	// Clean up after tests
	defer func() {
		app.Shutdown(ctx)
		os.Remove(testDB)
	}()

	// Test Questions API
	t.Run("QuestionsAPI", func(t *testing.T) {
		// Get all questions (should have initial questions)
		questions, err := app.GetAllQuestions()
		if err != nil {
			t.Fatalf("Failed to get questions: %v", err)
		}

		if len(questions) == 0 {
			t.Errorf("Expected initial questions, got none")
		}

		// Get random question
		randomQ, err := app.GetRandomQuestion()
		if err != nil {
			t.Fatalf("Failed to get random question: %v", err)
		}

		if randomQ == nil {
			t.Errorf("Expected random question, got nil")
		}

		// Create an answer for the random question
		testAnswer := "Test answer for integration test"
		answer, err := app.CreateNewAnswer(randomQ.ID, testAnswer)
		if err != nil {
			t.Fatalf("Failed to create answer: %v", err)
		}

		if answer.Content != testAnswer {
			t.Errorf("Expected answer content '%s', got '%s'", testAnswer, answer.Content)
		}

		// Get answer history for the question
		history, err := app.GetAnswerHistoryByQuestionID(randomQ.ID)
		if err != nil {
			t.Fatalf("Failed to get answer history: %v", err)
		}

		if len(history) == 0 {
			t.Errorf("Expected answer history, got none")
		}

		// Verify the answer is in the history
		found := false
		for _, a := range history {
			if a.Content == testAnswer {
				found = true
				break
			}
		}

		if !found {
			t.Errorf("Answer not found in history")
		}
	})

	// Test Affirmations API
	t.Run("AffirmationsAPI", func(t *testing.T) {
		// Create a new affirmation
		testAffirmation := "I am testing my code thoroughly"
		affirmation, err := app.SaveAffirmation(testAffirmation)
		if err != nil {
			t.Fatalf("Failed to save affirmation: %v", err)
		}

		if affirmation.Content != testAffirmation {
			t.Errorf("Expected affirmation content '%s', got '%s'", testAffirmation, affirmation.Content)
		}

		// Get active affirmation
		active, err := app.GetActiveAffirmation()
		if err != nil {
			t.Fatalf("Failed to get active affirmation: %v", err)
		}

		if active.Content != testAffirmation {
			t.Errorf("Expected active affirmation content '%s', got '%s'", testAffirmation, active.Content)
		}

		// Test logging affirmation
		err = app.LogAffirmation(affirmation.ID)
		if err != nil {
			t.Fatalf("Failed to log affirmation: %v", err)
		}

		// Test checking today's affirmation
		completed, err := app.CheckTodayAffirmation(affirmation.ID)
		if err != nil {
			t.Fatalf("Failed to check today's affirmation: %v", err)
		}

		if !completed {
			t.Errorf("Expected affirmation to be completed today")
		}

		// Test streak
		streak, err := app.GetAffirmationStreak()
		if err != nil {
			t.Fatalf("Failed to get streak: %v", err)
		}

		if streak != 1 {
			t.Errorf("Expected streak of 1, got %d", streak)
		}

		// Test getting all affirmations
		affirmations, err := app.GetAllAffirmations()
		if err != nil {
			t.Fatalf("Failed to get all affirmations: %v", err)
		}

		if len(affirmations) == 0 {
			t.Errorf("Expected affirmations, got none")
		}

		// Test getting all logs
		logs, err := app.GetAllAffirmationLogs()
		if err != nil {
			t.Fatalf("Failed to get affirmation logs: %v", err)
		}

		if len(logs) == 0 {
			t.Errorf("Expected affirmation logs, got none")
		}
	})

	// Test CRUD operations
	t.Run("CRUDOperations", func(t *testing.T) {
		// Test question CRUD
		testQuestion := "New question for CRUD test"
		question, err := models.AddQuestion(testQuestion)
		if err != nil {
			t.Fatalf("Failed to add question: %v", err)
		}

		// Update question
		updatedQuestion := "Updated question content"
		err = app.UpdateQuestion(question.ID, updatedQuestion)
		if err != nil {
			t.Fatalf("Failed to update question: %v", err)
		}

		// Delete question
		err = app.DeleteQuestion(question.ID)
		if err != nil {
			t.Fatalf("Failed to delete question: %v", err)
		}

		// Test answer CRUD
		randomQ, err := app.GetRandomQuestion()
		if err != nil {
			t.Fatalf("Failed to get random question: %v", err)
		}

		testAnswer := "Test answer for CRUD"
		answer, err := app.CreateNewAnswer(randomQ.ID, testAnswer)
		if err != nil {
			t.Fatalf("Failed to create answer: %v", err)
		}

		// Update answer
		updatedAnswer := "Updated answer content"
		err = app.UpdateAnswer(answer.ID, updatedAnswer)
		if err != nil {
			t.Fatalf("Failed to update answer: %v", err)
		}

		// Delete answer
		err = app.DeleteAnswer(answer.ID)
		if err != nil {
			t.Fatalf("Failed to delete answer: %v", err)
		}

		// Test affirmation CRUD
		testAffirmation := "Test affirmation for CRUD"
		affirmation, err := app.SaveAffirmation(testAffirmation)
		if err != nil {
			t.Fatalf("Failed to save affirmation: %v", err)
		}

		// Update affirmation
		updatedAffirmation := "Updated affirmation content"
		err = app.UpdateAffirmation(affirmation.ID, updatedAffirmation)
		if err != nil {
			t.Fatalf("Failed to update affirmation: %v", err)
		}

		// Log affirmation to create a log entry
		err = app.LogAffirmation(affirmation.ID)
		if err != nil {
			t.Fatalf("Failed to log affirmation: %v", err)
		}

		// Get logs to find a log ID
		logs, err := app.GetAllAffirmationLogs()
		if err != nil {
			t.Fatalf("Failed to get logs: %v", err)
		}

		if len(logs) == 0 {
			t.Fatalf("No logs found to test deletion")
		}

		// Delete log
		err = app.DeleteAffirmationLog(logs[0].ID)
		if err != nil {
			t.Fatalf("Failed to delete affirmation log: %v", err)
		}

		// Delete affirmation
		err = app.DeleteAffirmation(affirmation.ID)
		if err != nil {
			t.Fatalf("Failed to delete affirmation: %v", err)
		}
	})
}

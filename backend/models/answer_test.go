// backend/models/answer_test.go
package models

import (
	"myproject/backend/database"
	"os"
	"testing"
)

func TestAnswerModel(t *testing.T) {
	// Set up test database
	testDB := "./test_answer.db"

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

	// Create a question to use for answers
	var questionID int64
	t.Run("Setup", func(t *testing.T) {
		question, err := AddQuestion("Test question for answers")
		if err != nil {
			t.Fatalf("Failed to create test question: %v", err)
		}
		questionID = question.ID
	})

	// Test CreateNewAnswer
	t.Run("CreateNewAnswer", func(t *testing.T) {
		content := "This is my answer to the question"
		answer, err := CreateNewAnswer(questionID, content)

		if err != nil {
			t.Fatalf("Failed to create answer: %v", err)
		}

		if answer.ID <= 0 {
			t.Errorf("Expected valid ID, got %d", answer.ID)
		}

		if answer.Content != content {
			t.Errorf("Expected content '%s', got '%s'", content, answer.Content)
		}

		if answer.QuestionID != questionID {
			t.Errorf("Expected question ID %d, got %d", questionID, answer.QuestionID)
		}
	})

	// Test GetAnswerHistoryByQuestionID
	t.Run("GetAnswerHistoryByQuestionID", func(t *testing.T) {
		// Add multiple answers for the question
		expectedAnswers := []string{
			"Answer 1",
			"Answer 2",
			"Answer 3",
		}

		for _, a := range expectedAnswers {
			_, err := CreateNewAnswer(questionID, a)
			if err != nil {
				t.Fatalf("Failed to create answer: %v", err)
			}
		}

		// Get answer history
		answers, err := GetAnswerHistoryByQuestionID(questionID)
		if err != nil {
			t.Fatalf("Failed to get answer history: %v", err)
		}

		// We should have at least the number of answers we just added
		if len(answers) < len(expectedAnswers) {
			t.Errorf("Expected at least %d answers, got %d", len(expectedAnswers), len(answers))
		}

		// Verify the most recent answers are included (they should be at the beginning due to DESC order)
		for _, expected := range expectedAnswers {
			found := false
			for _, a := range answers {
				if a.Content == expected {
					found = true
					break
				}
			}

			if !found {
				t.Errorf("Answer '%s' not found in results", expected)
			}
		}
	})

	// Test GetAllAnswers
	t.Run("GetAllAnswers", func(t *testing.T) {
		// Create a new question
		newQuestion, err := AddQuestion("Another test question")
		if err != nil {
			t.Fatalf("Failed to create question: %v", err)
		}

		// Add answer to the new question
		newContent := "Answer to another question"
		_, err = CreateNewAnswer(newQuestion.ID, newContent)
		if err != nil {
			t.Fatalf("Failed to create answer: %v", err)
		}

		// Get all answers
		answers, err := GetAllAnswers()
		if err != nil {
			t.Fatalf("Failed to get all answers: %v", err)
		}

		// Verify we have answers
		if len(answers) == 0 {
			t.Errorf("Expected answers, got none")
		}

		// Verify the newest answer is included
		found := false
		for _, a := range answers {
			if a.Content == newContent && a.QuestionID == newQuestion.ID {
				found = true
				break
			}
		}

		if !found {
			t.Errorf("New answer not found in results")
		}
	})

	// Test CRUD operations
	t.Run("AnswerCRUD", func(t *testing.T) {
		// Create
		content := "Original answer"
		answer, err := CreateNewAnswer(questionID, content)
		if err != nil {
			t.Fatalf("Failed to create answer: %v", err)
		}

		// Update
		newContent := "Updated answer"
		err = UpdateAnswer(answer.ID, newContent)
		if err != nil {
			t.Fatalf("Failed to update answer: %v", err)
		}

		// Get all to verify update
		answers, err := GetAllAnswers()
		if err != nil {
			t.Fatalf("Failed to get answers: %v", err)
		}

		found := false
		for _, a := range answers {
			if a.ID == answer.ID {
				if a.Content != newContent {
					t.Errorf("Expected updated content '%s', got '%s'", newContent, a.Content)
				}
				found = true
				break
			}
		}

		if !found {
			t.Errorf("Failed to find updated answer")
		}

		// Delete
		err = DeleteAnswer(answer.ID)
		if err != nil {
			t.Fatalf("Failed to delete answer: %v", err)
		}

		// Verify deletion
		answers, err = GetAllAnswers()
		if err != nil {
			t.Fatalf("Failed to get answers: %v", err)
		}

		for _, a := range answers {
			if a.ID == answer.ID {
				t.Errorf("Answer still exists after deletion")
				break
			}
		}
	})
}

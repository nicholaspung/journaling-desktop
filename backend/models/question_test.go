// backend/models/question_test.go
package models

import (
	"myproject/backend/database"
	"os"
	"testing"
)

func TestQuestionModel(t *testing.T) {
	// Set up test database
	testDB := "./test_question.db"

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

	// Test AddQuestion
	t.Run("AddQuestion", func(t *testing.T) {
		content := "What inspired you today?"
		question, err := AddQuestion(content)

		if err != nil {
			t.Fatalf("Failed to add question: %v", err)
		}

		if question.ID <= 0 {
			t.Errorf("Expected valid ID, got %d", question.ID)
		}

		if question.Content != content {
			t.Errorf("Expected content '%s', got '%s'", content, question.Content)
		}
	})

	// Test GetRandomQuestion
	t.Run("GetRandomQuestion", func(t *testing.T) {
		// Add a few questions
		questions := []string{
			"What are your goals for today?",
			"What are you thankful for?",
			"What was your biggest challenge today?",
		}

		for _, q := range questions {
			_, err := AddQuestion(q)
			if err != nil {
				t.Fatalf("Failed to add question: %v", err)
			}
		}

		// Get a random question
		question, err := GetRandomQuestion()
		if err != nil {
			t.Fatalf("Failed to get random question: %v", err)
		}

		// Verify the question content is one of the added ones
		found := false
		for _, q := range questions {
			if question.Content == q {
				found = true
				break
			}
		}

		if !found {
			t.Errorf("Random question content '%s' doesn't match any added questions", question.Content)
		}
	})

	// Test GetAllQuestions
	t.Run("GetAllQuestions", func(t *testing.T) {
		// Reset database
		database.Close()
		os.Remove(testDB)
		database.Initialize(testDB)

		// Add some questions
		expectedQuestions := []string{
			"Question 1",
			"Question 2",
			"Question 3",
		}

		for _, q := range expectedQuestions {
			_, err := AddQuestion(q)
			if err != nil {
				t.Fatalf("Failed to add question: %v", err)
			}
		}

		// Get all questions
		questions, err := GetAllQuestions()
		if err != nil {
			t.Fatalf("Failed to get all questions: %v", err)
		}

		if len(questions) != len(expectedQuestions) {
			t.Errorf("Expected %d questions, got %d", len(expectedQuestions), len(questions))
		}

		// Verify content (order may be different due to DESC sort)
		for _, expected := range expectedQuestions {
			found := false
			for _, q := range questions {
				if q.Content == expected {
					found = true
					break
				}
			}

			if !found {
				t.Errorf("Question '%s' not found in results", expected)
			}
		}
	})

	// Test CRUD operations
	t.Run("QuestionCRUD", func(t *testing.T) {
		// Create
		content := "Original question"
		question, err := AddQuestion(content)
		if err != nil {
			t.Fatalf("Failed to add question: %v", err)
		}

		// Update
		newContent := "Updated question"
		err = UpdateQuestion(question.ID, newContent)
		if err != nil {
			t.Fatalf("Failed to update question: %v", err)
		}

		// Get all to verify update
		questions, err := GetAllQuestions()
		if err != nil {
			t.Fatalf("Failed to get questions: %v", err)
		}

		found := false
		for _, q := range questions {
			if q.ID == question.ID {
				if q.Content != newContent {
					t.Errorf("Expected updated content '%s', got '%s'", newContent, q.Content)
				}
				found = true
				break
			}
		}

		if !found {
			t.Errorf("Failed to find updated question")
		}

		// Create an answer for this question to test cascade delete
		_, err = CreateNewAnswer(question.ID, "Test answer")
		if err != nil {
			t.Fatalf("Failed to create answer: %v", err)
		}

		// Delete
		err = DeleteQuestion(question.ID)
		if err != nil {
			t.Fatalf("Failed to delete question: %v", err)
		}

		// Verify deletion
		questions, err = GetAllQuestions()
		if err != nil {
			t.Fatalf("Failed to get questions: %v", err)
		}

		for _, q := range questions {
			if q.ID == question.ID {
				t.Errorf("Question still exists after deletion")
				break
			}
		}

		// Verify associated answers were deleted
		answers, err := GetAnswerHistoryByQuestionID(question.ID)
		if err != nil {
			t.Fatalf("Failed to get answers: %v", err)
		}

		if len(answers) > 0 {
			t.Errorf("Expected 0 answers after question deletion, got %d", len(answers))
		}
	})
}

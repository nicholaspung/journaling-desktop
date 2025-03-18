// backend/models/answer.go
package models

import (
	"time"

	"myproject/backend/database"
)

type Answer struct {
	ID         int64     `json:"id"`
	QuestionID int64     `json:"questionId"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// GetAnswerByQuestionID retrieves an answer for a specific question
func GetAnswerByQuestionID(questionID int64) (*Answer, error) {
	var answer Answer

	err := database.DB.QueryRow(`
		SELECT id, question_id, content, created_at, updated_at 
		FROM answers 
		WHERE question_id = ?`, questionID).Scan(
		&answer.ID, &answer.QuestionID, &answer.Content, &answer.CreatedAt, &answer.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &answer, nil
}

// SaveAnswer creates or updates an answer
func SaveAnswer(questionID int64, content string) (*Answer, error) {
	// Check if an answer already exists for this question
	var count int
	err := database.DB.QueryRow(`
		SELECT COUNT(*) 
		FROM answers 
		WHERE question_id = ?`, questionID).Scan(&count)

	if err != nil {
		return nil, err
	}

	now := time.Now()
	var result Answer

	if count > 0 {
		// Update existing answer
		_, err = database.DB.Exec(`
			UPDATE answers 
			SET content = ?, updated_at = ? 
			WHERE question_id = ?`, content, now, questionID)

		if err != nil {
			return nil, err
		}

		err = database.DB.QueryRow(`
			SELECT id, question_id, content, created_at, updated_at 
			FROM answers 
			WHERE question_id = ?`, questionID).Scan(
			&result.ID, &result.QuestionID, &result.Content, &result.CreatedAt, &result.UpdatedAt)

		if err != nil {
			return nil, err
		}

	} else {
		// Create new answer
		res, err := database.DB.Exec(`
			INSERT INTO answers (question_id, content) 
			VALUES (?, ?)`, questionID, content)

		if err != nil {
			return nil, err
		}

		id, err := res.LastInsertId()
		if err != nil {
			return nil, err
		}

		result = Answer{
			ID:         id,
			QuestionID: questionID,
			Content:    content,
			CreatedAt:  now,
			UpdatedAt:  now,
		}
	}

	return &result, nil
}

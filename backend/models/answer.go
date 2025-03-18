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

// AnswerHistory combines the answer with the date it was created
type AnswerHistory struct {
	ID         int64     `json:"id"`
	QuestionID int64     `json:"questionId"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// GetAnswerHistoryByQuestionID retrieves all answers for a specific question
func GetAnswerHistoryByQuestionID(questionID int64) ([]AnswerHistory, error) {
	rows, err := database.DB.Query(`
		SELECT id, question_id, content, created_at, updated_at 
		FROM answers 
		WHERE question_id = ? 
		ORDER BY created_at DESC`, questionID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var answers []AnswerHistory
	for rows.Next() {
		var a AnswerHistory

		err := rows.Scan(&a.ID, &a.QuestionID, &a.Content, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			return nil, err
		}

		answers = append(answers, a)
	}

	return answers, nil
}

// CreateNewAnswer creates a new answer entry
func CreateNewAnswer(questionID int64, content string) (*Answer, error) {
	now := time.Now()

	// Create new answer
	res, err := database.DB.Exec(`
		INSERT INTO answers (question_id, content, created_at, updated_at) 
		VALUES (?, ?, ?, ?)`, questionID, content, now, now)

	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	result := Answer{
		ID:         id,
		QuestionID: questionID,
		Content:    content,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	return &result, nil
}

// GetAllAnswers retrieves all answers from the database
func GetAllAnswers() ([]Answer, error) {
	rows, err := database.DB.Query(`
		SELECT id, question_id, content, created_at, updated_at 
		FROM answers 
		ORDER BY created_at DESC`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var answers []Answer
	for rows.Next() {
		var a Answer
		err := rows.Scan(&a.ID, &a.QuestionID, &a.Content, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			return nil, err
		}
		answers = append(answers, a)
	}

	return answers, nil
}

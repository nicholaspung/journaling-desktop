// backend/models/answer.go
package models

import (
	"database/sql"
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

// GetTodaysAnswer retrieves the answer created today, if any
func GetTodaysAnswer() (*Answer, error) {
	// This is the critical fix - we keep date calculation entirely in SQLite
	// using 'localtime' to ensure proper timezone handling

	var answer Answer
	err := database.DB.QueryRow(`
		SELECT a.id, a.question_id, a.content, a.created_at, a.updated_at 
		FROM answers a
		WHERE date(a.created_at, 'localtime') = date('now', 'localtime')
		ORDER BY a.created_at DESC
		LIMIT 1`).Scan(
		&answer.ID, &answer.QuestionID, &answer.Content, &answer.CreatedAt, &answer.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			// No answer found for today
			return nil, nil
		}
		return nil, err
	}

	return &answer, nil
}

// GetQuestionById retrieves a specific question by its ID
func GetQuestionById(id int64) (*Question, error) {
	var question Question

	err := database.DB.QueryRow(`
		SELECT id, content, created_at 
		FROM questions 
		WHERE id = ?`, id).Scan(
		&question.ID, &question.Content, &question.CreatedAt)

	if err != nil {
		return nil, err
	}

	return &question, nil
}

// GetTodaysAnsweredQuestion retrieves both today's answer and its associated question
// Returns a struct with answer and question fields for better TypeScript integration
type TodaysAnsweredQuestion struct {
	Answer   *Answer   `json:"answer"`
	Question *Question `json:"question"`
}

func GetTodaysAnsweredQuestion() (*TodaysAnsweredQuestion, error) {
	// Get today's answer
	answer, err := GetTodaysAnswer()
	if err != nil {
		return nil, err
	}

	// If no answer found for today, return nil values
	if answer == nil {
		return &TodaysAnsweredQuestion{
			Answer:   nil,
			Question: nil,
		}, nil
	}

	// Get the question that was answered
	question, err := GetQuestionById(answer.QuestionID)
	if err != nil {
		return &TodaysAnsweredQuestion{
			Answer:   answer,
			Question: nil,
		}, nil
	}

	return &TodaysAnsweredQuestion{
		Answer:   answer,
		Question: question,
	}, nil
}

// GetAnswersByDate retrieves all answers for a specific day (for debugging)
// The dateStr should be in local timezone YYYY-MM-DD format
func GetAnswersByDate(dateStr string) ([]Answer, error) {
	rows, err := database.DB.Query(`
		SELECT id, question_id, content, created_at, updated_at
		FROM answers
		WHERE date(created_at, 'localtime') = ?
		ORDER BY created_at DESC`, dateStr)

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

// GetTodayDateStr returns today's date as a YYYY-MM-DD string in local timezone
func GetTodayDateStr() (string, error) {
	var dateStr string
	err := database.DB.QueryRow(`SELECT date('now', 'localtime')`).Scan(&dateStr)
	if err != nil {
		return "", err
	}
	return dateStr, nil
}

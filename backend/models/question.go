// backend/models/question.go
package models

import (
	"time"

	"myproject/backend/database"
)

type Question struct {
	ID        int64     `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

// GetRandomQuestion gets a random question
func GetRandomQuestion() (*Question, error) {
	var question Question

	err := database.DB.QueryRow(`
		SELECT id, content, created_at 
		FROM questions 
		ORDER BY RANDOM() 
		LIMIT 1`).Scan(
		&question.ID, &question.Content, &question.CreatedAt)

	if err != nil {
		return nil, err
	}

	return &question, nil
}

// GetAllQuestions retrieves all questions from the database
func GetAllQuestions() ([]Question, error) {
	rows, err := database.DB.Query(`
		SELECT id, content, created_at 
		FROM questions 
		ORDER BY created_at DESC`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []Question
	for rows.Next() {
		var q Question

		err := rows.Scan(&q.ID, &q.Content, &q.CreatedAt)
		if err != nil {
			return nil, err
		}

		questions = append(questions, q)
	}

	return questions, nil
}

// AddQuestion adds a new question to the database
func AddQuestion(content string) (*Question, error) {
	res, err := database.DB.Exec(`
		INSERT INTO questions (content) 
		VALUES (?)`, content)

	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &Question{
		ID:        id,
		Content:   content,
		CreatedAt: time.Now(),
	}, nil
}

// UpdateQuestion updates a question in the database
func UpdateQuestion(id int64, content string) error {
	_, err := database.DB.Exec(`
		UPDATE questions 
		SET content = ? 
		WHERE id = ?`, content, id)
	return err
}

// DeleteQuestion deletes a question and its associated answers
func DeleteQuestion(id int64) error {
	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}

	// Delete associated answers first
	_, err = tx.Exec(`DELETE FROM answers WHERE question_id = ?`, id)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Delete the question
	_, err = tx.Exec(`DELETE FROM questions WHERE id = ?`, id)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

// backend/models/answer.go
// Add these functions to your answer.go file

// UpdateAnswer updates an answer in the database
func UpdateAnswer(id int64, content string) error {
	now := time.Now()
	_, err := database.DB.Exec(`
		UPDATE answers 
		SET content = ?, updated_at = ? 
		WHERE id = ?`, content, now, id)
	return err
}

// DeleteAnswer deletes an answer from the database
func DeleteAnswer(id int64) error {
	_, err := database.DB.Exec(`DELETE FROM answers WHERE id = ?`, id)
	return err
}

// backend/models/affirmation.go
// Add these functions to your affirmation.go file

// UpdateAffirmation updates an affirmation in the database
func UpdateAffirmation(id int64, content string) error {
	now := time.Now()
	_, err := database.DB.Exec(`
		UPDATE affirmations 
		SET content = ?, updated_at = ? 
		WHERE id = ?`, content, now, id)
	return err
}

// DeleteAffirmation deletes an affirmation and its associated logs
func DeleteAffirmation(id int64) error {
	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}

	// Delete associated logs first
	_, err = tx.Exec(`DELETE FROM affirmation_logs WHERE affirmation_id = ?`, id)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Delete the affirmation
	_, err = tx.Exec(`DELETE FROM affirmations WHERE id = ?`, id)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

// DeleteAffirmationLog deletes an affirmation log from the database
func DeleteAffirmationLog(id int64) error {
	_, err := database.DB.Exec(`DELETE FROM affirmation_logs WHERE id = ?`, id)
	return err
}

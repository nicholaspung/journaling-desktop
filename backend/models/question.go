// backend/models/question.go
package models

import (
	"database/sql"
	"time"

	"myproject/backend/database"
)

type Question struct {
	ID        int64     `json:"id"`
	Content   string    `json:"content"`
	UsedOn    time.Time `json:"usedOn,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

// GetDailyQuestion gets a random question that hasn't been used yet
func GetDailyQuestion() (*Question, error) {
	// First check if we've already used a question today
	var question Question
	today := time.Now().Format("2006-01-02")

	err := database.DB.QueryRow(`
		SELECT id, content, used_on, created_at 
		FROM questions 
		WHERE used_on = ?`, today).Scan(
		&question.ID, &question.Content, &question.UsedOn, &question.CreatedAt)

	if err == nil {
		// We already have a question for today
		return &question, nil
	}

	// No question for today, get a random unused one
	err = database.DB.QueryRow(`
		SELECT id, content, created_at 
		FROM questions 
		WHERE used_on IS NULL 
		ORDER BY RANDOM() 
		LIMIT 1`).Scan(
		&question.ID, &question.Content, &question.CreatedAt)

	if err != nil {
		return nil, err
	}

	// Mark this question as used today
	_, err = database.DB.Exec(`
		UPDATE questions 
		SET used_on = ? 
		WHERE id = ?`, today, question.ID)

	if err != nil {
		return nil, err
	}

	question.UsedOn = time.Now()
	return &question, nil
}

// GetAllQuestions retrieves all questions from the database
func GetAllQuestions() ([]Question, error) {
	rows, err := database.DB.Query(`
		SELECT id, content, used_on, created_at 
		FROM questions 
		ORDER BY created_at DESC`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []Question
	for rows.Next() {
		var q Question
		var usedOn sql.NullTime

		err := rows.Scan(&q.ID, &q.Content, &usedOn, &q.CreatedAt)
		if err != nil {
			return nil, err
		}

		if usedOn.Valid {
			q.UsedOn = usedOn.Time
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

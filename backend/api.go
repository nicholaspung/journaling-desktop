// backend/api.go
package backend

import (
	"context"

	"myproject/backend/database"
	"myproject/backend/models"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize the database
	err := database.Initialize("./app.db")
	if err != nil {
		println("Error initializing database:", err.Error())
	}

	// Add some initial questions if database is empty
	count := 0
	database.DB.QueryRow("SELECT COUNT(*) FROM questions").Scan(&count)

	if count == 0 {
		initialQuestions := []string{
			"What am I grateful for today?",
			"What's something I learned recently?",
			"What's a challenge I'm currently facing and how can I overcome it?",
			"What brings me joy in my daily life?",
			"What's one small step I can take today towards my biggest goal?",
			"How can I be kinder to myself today?",
			"What's something I appreciate about my body?",
			"What's a belief I hold that might be limiting me?",
			"If I had unlimited resources, what would I do with my life?",
			"What relationships in my life deserve more attention?",
		}

		for _, q := range initialQuestions {
			models.AddQuestion(q)
		}
	}
}

// shutdown is called when the app is about to quit
func (a *App) Shutdown(ctx context.Context) {
	database.Close()
}

// GetDailyQuestion returns the question for today
func (a *App) GetDailyQuestion() (*models.Question, error) {
	return models.GetDailyQuestion()
}

// SaveAnswer creates or updates an answer for a question
func (a *App) SaveAnswer(questionID int64, content string) (*models.Answer, error) {
	return models.SaveAnswer(questionID, content)
}

// GetAnswer gets the answer for a specific question
func (a *App) GetAnswer(questionID int64) (*models.Answer, error) {
	return models.GetAnswerByQuestionID(questionID)
}

// GetActiveAffirmation gets the current active affirmation
func (a *App) GetActiveAffirmation() (*models.Affirmation, error) {
	return models.GetActiveAffirmation()
}

// SaveAffirmation saves a new affirmation
func (a *App) SaveAffirmation(content string) (*models.Affirmation, error) {
	return models.SaveAffirmation(content)
}

// LogAffirmation logs that the user has completed their affirmation today
func (a *App) LogAffirmation(affirmationID int64) error {
	return models.LogAffirmationCompletion(affirmationID)
}

// CheckTodayAffirmation checks if the affirmation was completed today
func (a *App) CheckTodayAffirmation(affirmationID int64) (bool, error) {
	return models.CheckTodayAffirmation(affirmationID)
}

// GetAffirmationStreak gets the current streak of consecutive days
func (a *App) GetAffirmationStreak() (int, error) {
	return models.GetAffirmationStreak()
}

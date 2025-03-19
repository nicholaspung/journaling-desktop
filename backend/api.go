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

// GetAllQuestions retrieves all questions from the database
func (a *App) GetAllQuestions() ([]models.Question, error) {
	return models.GetAllQuestions()
}

// GetAllAnswers retrieves all answers from the database
func (a *App) GetAllAnswers() ([]models.Answer, error) {
	return models.GetAllAnswers()
}

// GetAllAffirmations retrieves all affirmations from the database
func (a *App) GetAllAffirmations() ([]models.Affirmation, error) {
	return models.GetAllAffirmations()
}

// GetAllAffirmationLogs retrieves all affirmation logs from the database
func (a *App) GetAllAffirmationLogs() ([]models.AffirmationLog, error) {
	return models.GetAllAffirmationLogs()
}

// GetRandomQuestion returns a random question
func (a *App) GetRandomQuestion() (*models.Question, error) {
	return models.GetRandomQuestion()
}

// CreateNewAnswer creates a new answer entry
func (a *App) CreateNewAnswer(questionID int64, content string) (*models.Answer, error) {
	return models.CreateNewAnswer(questionID, content)
}

// GetAnswerHistoryByQuestionID gets all answers for a specific question
func (a *App) GetAnswerHistoryByQuestionID(questionID int64) ([]models.AnswerHistory, error) {
	return models.GetAnswerHistoryByQuestionID(questionID)
}

// Question CRUD operations
func (a *App) AddQuestion(content string) (*models.Question, error) {
	return models.AddQuestion(content)
}

func (a *App) UpdateQuestion(id int64, content string) error {
	return models.UpdateQuestion(id, content)
}

func (a *App) DeleteQuestion(id int64) error {
	return models.DeleteQuestion(id)
}

// Answer CRUD operations
func (a *App) UpdateAnswer(id int64, content string) error {
	return models.UpdateAnswer(id, content)
}

func (a *App) DeleteAnswer(id int64) error {
	return models.DeleteAnswer(id)
}

// Affirmation CRUD operations
func (a *App) UpdateAffirmation(id int64, content string) error {
	return models.UpdateAffirmation(id, content)
}

func (a *App) DeleteAffirmation(id int64) error {
	return models.DeleteAffirmation(id)
}

// Affirmation Log CRUD operations
func (a *App) DeleteAffirmationLog(id int64) error {
	return models.DeleteAffirmationLog(id)
}

// GetRecentAnswers retrieves answers from the last few days
func (a *App) GetRecentAnswers(daysRange int) ([]models.Answer, error) {
	return models.GetRecentAnswers(daysRange)
}

// GetQuestionById retrieves a specific question by its ID
func (a *App) GetQuestionById(id int64) (*models.Question, error) {
	return models.GetQuestionById(id)
}

// Gratitude Journal API Methods

// AddGratitudeItem adds a new gratitude item for today
func (a *App) AddGratitudeItem(content string) (*models.GratitudeItem, error) {
	return models.AddGratitudeItem(content)
}

// GetTodayGratitudeItems gets all gratitude items for today
func (a *App) GetTodayGratitudeItems() ([]models.GratitudeItem, error) {
	return models.GetTodayGratitudeItems()
}

// GetGratitudeItemsByDate gets all gratitude items for a specific date
func (a *App) GetGratitudeItemsByDate(date string) ([]models.GratitudeItem, error) {
	return models.GetGratitudeItemsByDate(date)
}

// HasTodayGratitudeEntries checks if there are any entries for today
func (a *App) HasTodayGratitudeEntries() (bool, error) {
	return models.HasTodayGratitudeEntries()
}

// CountTodayGratitudeEntries counts the number of entries for today
func (a *App) CountTodayGratitudeEntries() (int, error) {
	return models.CountTodayGratitudeEntries()
}

// GetAllGratitudeEntries gets all gratitude entries grouped by date
func (a *App) GetAllGratitudeEntries() ([]models.GratitudeEntry, error) {
	return models.GetAllGratitudeEntries()
}

// UpdateGratitudeItem updates a gratitude item
func (a *App) UpdateGratitudeItem(id int64, content string) error {
	return models.UpdateGratitudeItem(id, content)
}

// DeleteGratitudeItem deletes a gratitude item
func (a *App) DeleteGratitudeItem(id int64) error {
	return models.DeleteGratitudeItem(id)
}

// GetLastNDaysWithGratitude gets entries for the last n days
func (a *App) GetLastNDaysWithGratitude(n int) ([]models.GratitudeEntry, error) {
	return models.GetLastNDaysWithGratitude(n)
}

// GetGratitudeStreak calculates the current streak of consecutive days with gratitude entries
func (a *App) GetGratitudeStreak() (int, error) {
	return models.GetGratitudeStreak()
}

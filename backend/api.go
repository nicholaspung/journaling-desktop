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
			"What is one small victory I can celebrate about myself today?",
			"How have my priorities shifted in the past year, and what does that reveal about my growth?",
			"What negative thought pattern do I want to release, and what would I replace it with?",
			"When did I last feel truly at peace, and how can I create more of those moments?",
			"What advice would my future self, 10 years from now, give to me today?",
			"Which of my personal strengths have I been underutilizing lately?",
			"What fear has been holding me back, and what's one small way I could face it?",
			"Who has positively influenced me recently, and what qualities of theirs do I admire?",
			"What boundaries do I need to establish or reinforce in my life right now?",
			"When do I feel most authentically myself, and how can I bring more of that into my daily life?",
			"What am I holding onto that no longer serves my growth or happiness?",
			"How do I typically respond to failure, and how might I respond more constructively?",
			"What skill or area of knowledge would I like to develop further, and why?",
			"What does 'success' mean to me right now, beyond external achievements?",
			"Which aspects of my life feel balanced, and which need more attention?",
			"What simple pleasures or small joys am I overlooking in my daily routine?",
			"How has a recent challenge changed my perspective or made me stronger?",
			"What am I curious about learning or exploring more deeply?",
			"In what ways have I been kind to others recently, and how did it make me feel?",
			"What activity makes me lose track of time in a positive way, and how could I engage in it more often?",
			"When do I feel most connected to something greater than myself?",
			"What past mistake am I still carrying, and how could I practice forgiveness—either of myself or someone else?",
			"What would a perfect day look like for me right now, and what elements of it could I incorporate into my life?",
			"How do my surroundings affect my mood and productivity, and what small change could improve them?",
			"What would I do differently if I knew no one would judge me?",
			"What recurring dreams or aspirations keep coming back to me, and what might they be telling me?",
			"How do I recharge when I'm feeling depleted, and am I making enough time for it?",
			"What habit would I like to develop, and what's the smallest first step I could take?",
			"When was the last time I truly surprised myself, and what did I learn from it?",
			"What legacy or impact would I like to leave in the lives of those around me?",
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

// SaveCreativityEntry saves a creativity journal entry for a specific date
func (a *App) SaveCreativityEntry(content string, entryDate string) (*models.CreativityEntry, error) {
	return models.SaveCreativityEntry(content, entryDate)
}

// GetCreativityEntryByDate retrieves the creativity journal entry for a specific date
func (a *App) GetCreativityEntryByDate(entryDate string) (*models.CreativityEntry, error) {
	return models.GetCreativityEntryByDate(entryDate)
}

// GetAllCreativityEntries retrieves all creativity journal entries
func (a *App) GetAllCreativityEntries() ([]models.CreativityEntry, error) {
	return models.GetAllCreativityEntries()
}

// UpdateCreativityEntry updates a creativity journal entry
func (a *App) UpdateCreativityEntry(id int64, content string) error {
	return models.UpdateCreativityEntry(id, content)
}

// DeleteCreativityEntry deletes a creativity journal entry
func (a *App) DeleteCreativityEntry(id int64) error {
	return models.DeleteCreativityEntry(id)
}

// HasCreativityEntryForDate checks if there is a creativity journal entry for the given date
func (a *App) HasCreativityEntryForDate(entryDate string) (bool, error) {
	return models.HasCreativityEntryForDate(entryDate)
}

// GetCreativityStreak returns the current streak of consecutive days with creativity entries
func (a *App) GetCreativityStreak() (int, error) {
	return models.GetCreativityStreak()
}

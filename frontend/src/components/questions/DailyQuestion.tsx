import { useState, useEffect } from "react";
import { Answer, Question } from "../../types";
import {
  GetRandomQuestion,
  CreateNewAnswer,
  GetAnswerHistoryByQuestionID,
  GetRecentAnswers,
  GetQuestionById,
  UpdateAnswer,
} from "../../../wailsjs/go/backend/App";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CalendarDays, Edit2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import WysiwygMarkdownEditor from "./wysiwyg-markdown-editor";
import { toast } from "sonner";

export default function DailyQuestion() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [answerHistory, setAnswerHistory] = useState<Answer[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [todaysAnswer, setTodaysAnswer] = useState<Answer | null>(null);
  const [answeredToday, setAnsweredToday] = useState(false);

  useEffect(() => {
    checkTodaysAnswer();
  }, []);

  // Check if the date is today
  const isDateToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a question was already answered today (client-side approach)
  async function checkTodaysAnswer() {
    setIsLoading(true);
    try {
      // Get answers from the last 7 days to be safe
      const recentAnswers = await GetRecentAnswers(7);

      // Filter for today's answers by comparing the date parts
      const todayAnswers = recentAnswers.filter((answer) => {
        const answerDate = new Date(answer.createdAt);
        const isToday = isDateToday(answerDate);

        return isToday;
      });

      if (todayAnswers.length > 0) {
        // User has already answered a question today
        // Get the most recent answer from today
        const todayAnswer = todayAnswers[0];
        console.log("Found today's answer:", todayAnswer);

        // Fetch the associated question
        const todayQuestion = await GetQuestionById(todayAnswer.questionId);
        console.log("Found today's question:", todayQuestion);

        if (todayQuestion) {
          setTodaysAnswer(todayAnswer);
          setQuestion(todayQuestion);
          setAnsweredToday(true);
          setContent(todayAnswer.content);

          // Get the answer history for this question
          await fetchAnswerHistory(todayQuestion.id);
        } else {
          // Fallback to random question if we can't find today's question
          setAnsweredToday(false);
          setIsEditing(true);
          await fetchRandomQuestion();
        }
      } else {
        // User hasn't answered a question today
        console.log("No answer found for today, fetching random question");
        setAnsweredToday(false);
        setIsEditing(true);
        await fetchRandomQuestion();
      }
    } catch (error) {
      console.error("Error checking today's answer:", error);
      await fetchRandomQuestion();
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRandomQuestion() {
    setContent("");

    try {
      const fetchedQuestion = await GetRandomQuestion();
      console.log("Fetched random question:", fetchedQuestion);
      setQuestion(fetchedQuestion);

      if (fetchedQuestion?.id) {
        fetchAnswerHistory(fetchedQuestion.id);
      }
    } catch (error) {
      console.error("Error fetching random question:", error);
    }
  }

  async function fetchAnswerHistory(questionId: number) {
    setIsLoadingHistory(true);
    try {
      const history = await GetAnswerHistoryByQuestionID(questionId);
      if (history && history.length > 0) {
        console.log("Answer history:", history);
        setAnswerHistory(history);
      } else {
        setAnswerHistory([]);
      }
    } catch (error) {
      console.error("Error fetching answer history:", error);
      setAnswerHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function handleSave() {
    if (!question || !content.trim()) return;

    setIsSaving(true);
    try {
      console.log("Saving answer for question ID:", question.id);
      const savedAnswer = await CreateNewAnswer(question.id, content);
      console.log("Saved new answer:", savedAnswer);

      // Update our state
      setIsEditing(false);
      setAnsweredToday(true);
      setTodaysAnswer(savedAnswer);

      // Show success message
      toast.success("Your answer has been saved!");

      // Refresh everything to ensure we have the latest data
      await checkTodaysAnswer();
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Error saving answer. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate() {
    if (!question || !content.trim() || !todaysAnswer) return;

    setIsSaving(true);
    try {
      await UpdateAnswer(todaysAnswer.id, content);
      console.log("Updated answer:", todaysAnswer.id);

      setIsEditing(false);

      // Show success message
      toast.success("Your answer has been updated!");

      // Refresh everything to ensure we have the latest data
      await checkTodaysAnswer();
    } catch (error) {
      console.error("Error updating answer:", error);
      toast.error("Error updating answer. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString;
    }
  };

  // Determine if the answer was created today
  const isToday = (dateString: string) => {
    try {
      return isDateToday(new Date(dateString));
    } catch (err) {
      console.error("Error in isToday function:", err);
      return false;
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Journal Question</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkTodaysAnswer}
              className="flex items-center gap-2"
              title="Reload today's question"
            >
              <RefreshCw size={16} />
              Reload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRandomQuestion}
              disabled={answeredToday}
              className="flex items-center gap-2"
              title={
                answeredToday
                  ? "You've already answered a question today"
                  : "Get a new random question"
              }
            >
              <RefreshCw size={16} />
              New Question
            </Button>
          </div>
        </div>
      </CardHeader>

      {isLoading ? (
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading question...</div>
        </CardContent>
      ) : (
        <Tabs defaultValue="write" className="w-full">
          <CardContent>
            <div className="text-xl font-medium mb-4">{question?.content}</div>
            <p className="font-light mb-4">
              Take a moment to reflect on this question and write your thoughts
              below.
            </p>

            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="write">
                {answeredToday ? "Today's Answer" : "Write"}
              </TabsTrigger>
              <TabsTrigger value="history">
                History{" "}
                {answerHistory.length > 0 && `(${answerHistory.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="write">
              <div className="mt-2">
                {isEditing ? (
                  <WysiwygMarkdownEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your answer here using markdown..."
                  />
                ) : (
                  <div className="relative prose dark:prose-invert max-w-none border rounded-md p-4">
                    {answeredToday && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 size={16} />
                      </Button>
                    )}
                    {content ? (
                      <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">
                        {answeredToday
                          ? "Click Edit to update your answer"
                          : "No answer yet. Start writing to add one."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              {isLoadingHistory ? (
                <div className="text-center py-4">Loading history...</div>
              ) : answerHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't answered this question before.
                </div>
              ) : (
                <div className="space-y-6 mt-2">
                  {answerHistory.map((historyItem) => (
                    <div
                      key={historyItem.id}
                      className={`border rounded-lg p-4 ${
                        isToday(historyItem.createdAt)
                          ? "border-primary border-2"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <CalendarDays size={14} />
                        {formatDate(historyItem.createdAt)}
                        {isToday(historyItem.createdAt) && (
                          <span className="text-primary font-medium ml-2">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{historyItem.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </CardContent>

          <CardFooter className="flex justify-between">
            {isEditing && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setContent(todaysAnswer ? todaysAnswer.content : "");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={answeredToday ? handleUpdate : handleSave}
                  disabled={isSaving || !content.trim()}
                >
                  {isSaving ? "Saving..." : answeredToday ? "Update" : "Save"}
                </Button>
              </div>
            )}
          </CardFooter>
        </Tabs>
      )}
    </Card>
  );
}

// src/components/DailyQuestion.tsx
import { useState, useEffect } from "react";
import { Answer, Question } from "../../types";
import {
  GetRandomQuestion,
  CreateNewAnswer,
  GetAnswerHistoryByQuestionID,
  UpdateAnswer,
  GetAnswersByDate,
  GetTodaysAnswer,
  GetTodayDateStr,
  GetTodaysAnsweredQuestion,
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
import { RefreshCw, CalendarDays, Edit2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import WysiwygMarkdownEditor from "./wysiwyg-markdown-editor";

export default function DailyQuestion() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [answerHistory, setAnswerHistory] = useState<Answer[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [todaysAnswer, setTodaysAnswer] = useState<Answer | null>(null);
  const [answeredToday, setAnsweredToday] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    checkTodaysAnswer();
  }, []);

  // Get debug information about today's date and answers
  async function getDebugInfo() {
    try {
      // Get SQLite's version of today's date to ensure consistency
      const sqliteToday = await GetTodayDateStr();

      // Try to get answers for today based on SQLite's date
      const todayAnswers = await GetAnswersByDate(sqliteToday);

      // Get today's answer using our dedicated endpoint
      const todayAnswer = await GetTodaysAnswer();

      // Build debug info string
      let info = `Debug Info:\n`;
      info += `Current Date (JS): ${new Date().toString()}\n`;
      info += `Today's Date (YYYY-MM-DD from JS): ${new Date().toISOString().split("T")[0]}\n`;
      info += `Today's Date (Local from JS): ${new Date().toLocaleDateString()}\n`;
      info += `Today's Date (from SQLite): ${sqliteToday}\n`;
      info += `Found ${todayAnswers ? todayAnswers.length : 0} answers with SQLite date = "${sqliteToday}"\n`;
      info += `GetTodaysAnswer returned: ${todayAnswer ? "Answer ID: " + todayAnswer.id : "null"}\n`;

      if (todayAnswers && todayAnswers.length > 0) {
        todayAnswers.forEach((answer, i) => {
          info += `\nAnswer ${i + 1}:\n`;
          info += `  ID: ${answer.id}\n`;
          info += `  Question ID: ${answer.questionId}\n`;
          info += `  Created: ${new Date(answer.createdAt).toString()}\n`;
          info += `  Created (ISO): ${answer.createdAt}\n`;
          info += `  Created Date (local): ${new Date(answer.createdAt).toLocaleDateString()}\n`;
        });
      }

      setDebugInfo(info);
    } catch (error) {
      console.error("Error getting debug info:", error);
      setDebugInfo(`Error getting debug info: ${error}`);
    }
  }

  // Check if a question was already answered today
  async function checkTodaysAnswer() {
    setIsLoading(true);
    try {
      // First, get debug info
      await getDebugInfo();

      // Use our backend endpoint to get today's answer and question
      const { answer, question } = await GetTodaysAnsweredQuestion();

      console.log("GetTodaysAnsweredQuestion result:", {
        answer,
        question,
      });

      if (answer && question) {
        // User has already answered a question today
        console.log("Found today's answer:", answer);
        console.log("Found today's question:", question);

        setTodaysAnswer(answer);
        setQuestion(question);
        setAnsweredToday(true);
        setContent(answer.content);

        // Get the answer history for this question
        await fetchAnswerHistory(question.id);
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
      setSuccessMessage("Your answer has been saved!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh the history
      if (question.id) {
        fetchAnswerHistory(question.id);
      }

      // Get updated debug info
      await getDebugInfo();
    } catch (error) {
      console.error("Error saving answer:", error);
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
      setSuccessMessage("Your answer has been updated!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh the history
      if (question.id) {
        fetchAnswerHistory(question.id);

        // Update today's answer with new content
        setTodaysAnswer({
          ...todaysAnswer,
          content: content,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating answer:", error);
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
      // Compare using the local date string format
      const answerDate = new Date(dateString).toLocaleDateString();
      const todayDate = new Date().toLocaleDateString();
      return answerDate === todayDate;
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

            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="write">
                {answeredToday ? "Today's Answer" : "Write"}
              </TabsTrigger>
              <TabsTrigger value="history">
                History{" "}
                {answerHistory.length > 0 && `(${answerHistory.length})`}
              </TabsTrigger>
              <TabsTrigger value="debug">Debug Info</TabsTrigger>
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

            <TabsContent value="debug">
              <div className="mt-2 border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={16} className="text-amber-500" />
                  <span className="font-medium">Debugging Information</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getDebugInfo}
                    className="ml-auto"
                  >
                    Refresh Debug Info
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-64">
                  {debugInfo || "No debug information available"}
                </pre>
              </div>
            </TabsContent>
          </CardContent>

          <CardFooter className="flex justify-between">
            <div>
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
            </div>

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

// src/components/DailyQuestion.tsx
import { useState, useEffect } from "react";
import { Answer, Question } from "../types";
import {
  GetRandomQuestion,
  CreateNewAnswer,
  GetAnswerHistoryByQuestionID,
} from "../../wailsjs/go/backend/App";
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
import { RefreshCw, CalendarDays } from "lucide-react";
import ReactMarkdown from "react-markdown";
import WysiwygMarkdownEditor from "./WysiwygMarkdownEditor";

export default function DailyQuestion() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [answerHistory, setAnswerHistory] = useState<Answer[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchRandomQuestion();
  }, []);

  async function fetchRandomQuestion() {
    setIsLoading(true);
    setContent("");
    setIsEditing(true);

    try {
      const fetchedQuestion = await GetRandomQuestion();
      setQuestion(fetchedQuestion);

      if (fetchedQuestion?.id) {
        fetchAnswerHistory(fetchedQuestion.id);
      }
    } catch (error) {
      console.error("Error fetching random question:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAnswerHistory(questionId: number) {
    setIsLoadingHistory(true);
    try {
      const history = await GetAnswerHistoryByQuestionID(questionId);
      if (history && history.length > 0) {
        console.log(history);
        setAnswerHistory(history);
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
      await CreateNewAnswer(question.id, content);
      setIsEditing(false);

      // Show success message
      setSuccessMessage("Your answer has been saved!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh the history
      if (question.id) {
        fetchAnswerHistory(question.id);
      }
    } catch (error) {
      console.error("Error saving answer:", error);
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
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRandomQuestion}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            New Question
          </Button>
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

            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="write">Write</TabsTrigger>
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
                  <div
                    className="prose dark:prose-invert max-w-none border rounded-md p-4"
                    onClick={() => setIsEditing(true)}
                  >
                    {content ? (
                      <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No answer yet. Click to add one.
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
                    <div key={historyItem.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <CalendarDays size={14} />
                        {formatDate(historyItem.createdAt)}
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
                    setContent("");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !content.trim()}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </CardFooter>
        </Tabs>
      )}
    </Card>
  );
}

// frontend/components/JournalPage.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, SaveIcon, RefreshCw } from "lucide-react";
import {
  GetRandomQuestion,
  GetAnswerHistoryByQuestionID,
  CreateNewAnswer,
} from "../../wailsjs/go/backend/App";
import { Answer, Question } from "@/types";

const JournalPage: React.FC = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [answerHistory, setAnswerHistory] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchRandomQuestion = async () => {
    try {
      setLoading(true);
      const randomQuestion = await GetRandomQuestion();
      setQuestion(randomQuestion);
      setAnswerContent(""); // Clear current answer

      // Fetch answer history for this question
      if (randomQuestion.id) {
        fetchAnswerHistory(randomQuestion.id);
      }
    } catch (error) {
      console.error("Error fetching random question:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswerHistory = async (questionId: number) => {
    try {
      setLoadingHistory(true);
      const history = await GetAnswerHistoryByQuestionID(questionId);
      setAnswerHistory(history);
    } catch (error) {
      console.error("Error fetching answer history:", error);
      setAnswerHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveAnswer = async () => {
    if (!question || !answerContent.trim()) return;

    try {
      setSaving(true);
      await CreateNewAnswer(question.id, answerContent);

      // Show success message
      setSuccessMessage("Your answer has been saved!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh history
      fetchAnswerHistory(question.id);
    } catch (error) {
      console.error("Error saving answer:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();

      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12

      return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString;
    }
  };

  useEffect(() => {
    fetchRandomQuestion();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daily Journal</h1>
        <Button
          onClick={fetchRandomQuestion}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          New Question
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading your question...</p>
        </div>
      ) : (
        <Tabs defaultValue="write" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="history">
              History {answerHistory.length > 0 && `(${answerHistory.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{question?.content}</CardTitle>
                <CardDescription>
                  Take a moment to reflect on this question and write your
                  thoughts below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Your thoughts..."
                  className="min-h-[200px]"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  {successMessage && (
                    <p className="text-green-500">{successMessage}</p>
                  )}
                </div>
                <Button
                  onClick={saveAnswer}
                  disabled={saving || !answerContent.trim()}
                  className="flex items-center gap-2"
                >
                  <SaveIcon size={16} />
                  {saving ? "Saving..." : "Save Answer"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Previous Answers</CardTitle>
                <CardDescription>
                  Your past responses to: "{question?.content}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-4">Loading history...</div>
                ) : answerHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    You haven't answered this question before.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {answerHistory.map((answer) => (
                      <div key={answer.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <CalendarDays size={14} />
                          {formatDate(answer.createdAt)}
                        </div>
                        <p className="whitespace-pre-wrap">{answer.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default JournalPage;

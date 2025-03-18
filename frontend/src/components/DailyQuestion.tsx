// src/components/DailyQuestion.tsx
import { useState, useEffect } from "react";
import { Question, Answer } from "../types";
import {
  GetDailyQuestion,
  GetAnswer,
  SaveAnswer,
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
import ReactMarkdown from "react-markdown";
import WysiwygMarkdownEditor from "./WysiwygMarkdownEditor";

export default function DailyQuestion() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDailyQuestion();
  }, []);

  async function fetchDailyQuestion() {
    try {
      const fetchedQuestion = await GetDailyQuestion();
      setQuestion(fetchedQuestion);

      if (fetchedQuestion?.id) {
        try {
          const fetchedAnswer = await GetAnswer(fetchedQuestion.id);
          if (fetchedAnswer) {
            setAnswer(fetchedAnswer);
            setContent(fetchedAnswer.content);
          } else {
            setIsEditing(true);
          }
        } catch (err) {
          console.error("Error fetching answer:", err);
          // No answer yet, enable editing
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error("Error fetching daily question:", error);
    }
  }

  async function handleSave() {
    if (!question || !content.trim()) return;

    setIsSaving(true);
    try {
      const savedAnswer = await SaveAnswer(question.id, content);
      setAnswer(savedAnswer);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving answer:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Today's Question</CardTitle>
        <CardDescription>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {question ? (
          <div className="text-xl font-medium">{question.content}</div>
        ) : (
          <div className="text-muted-foreground">
            Loading today's question...
          </div>
        )}

        {question && (
          <div className="mt-6">
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
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (answer) {
                  setContent(answer.content);
                  setIsEditing(false);
                } else {
                  setContent("");
                  setIsEditing(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            {answer ? "Edit" : "Add Answer"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Affirmation } from "../types";
import {
  GetActiveAffirmation,
  SaveAffirmation,
  LogAffirmation,
  CheckTodayAffirmation,
  GetAffirmationStreak,
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
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, CheckCircle2 } from "lucide-react";

export default function AffirmationTracker() {
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAffirmation();
  }, []);

  async function fetchAffirmation() {
    try {
      const fetchedAffirmation = await GetActiveAffirmation();
      if (fetchedAffirmation) {
        setAffirmation(fetchedAffirmation);
        setContent(fetchedAffirmation.content);

        // Check if completed today
        const completed = await CheckTodayAffirmation(fetchedAffirmation.id);
        setCompletedToday(completed);

        // Get streak
        const currentStreak = await GetAffirmationStreak();
        setStreak(currentStreak);
      } else {
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Error fetching affirmation:", err);
      // No affirmation yet, enable editing
      setIsEditing(true);
    }
  }

  async function handleSaveAffirmation() {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const savedAffirmation = await SaveAffirmation(content);
      setAffirmation(savedAffirmation);
      setCompletedToday(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving affirmation:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCompleteAffirmation() {
    if (!affirmation) return;

    try {
      await LogAffirmation(affirmation.id);
      setCompletedToday(true);

      // Update streak
      const currentStreak = await GetAffirmationStreak();
      setStreak(currentStreak);
    } catch (error) {
      console.error("Error logging affirmation:", error);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Daily Affirmation</CardTitle>
        <CardDescription className="flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4" />
          <span>
            Current streak: {streak} day{streak !== 1 ? "s" : ""}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium mb-2">
              Set your daily affirmation:
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="I am..."
              className="min-h-[100px]"
            />
          </div>
        ) : affirmation ? (
          <div className="bg-muted p-6 rounded-lg text-center text-xl font-medium italic">
            "{affirmation.content}"
          </div>
        ) : (
          <div className="text-muted-foreground">
            No affirmation set. Create one to get started.
          </div>
        )}

        {completedToday && (
          <div className="flex items-center justify-center text-green-500 gap-2 mt-4">
            <CheckCircle2 className="h-5 w-5" />
            <span>Completed today</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (affirmation) {
                  setContent(affirmation.content);
                  setIsEditing(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAffirmation} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            {affirmation && !completedToday && (
              <Button onClick={handleCompleteAffirmation}>
                Mark Completed
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}

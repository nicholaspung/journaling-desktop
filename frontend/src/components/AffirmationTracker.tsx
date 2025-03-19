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
import {
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AFFIRMATION_EXAMPLES } from "@/lib/affirmation-examples";

export default function AffirmationTracker() {
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

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
      toast.success(`Updated successfully. The affirmation has been updated.`);
    } catch (error) {
      console.error("Error saving affirmation:", error);
      toast.error(
        `Update failed. Failed to update the affirmation. Please try again.`
      );
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
      toast.success(
        `Affirmation completed successfully. Streak has increased.`
      );
    } catch (error) {
      console.error("Error logging affirmation:", error);
      toast.error(
        `Update failed. Failed to update the streak. Please try again.`
      );
    }
  }

  function handleSelectExample(example: string) {
    setContent(example);
    setShowExamples(false);
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
          <div className="space-y-4">
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

            <Collapsible
              open={showExamples}
              onOpenChange={setShowExamples}
              className="border rounded-md"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="h-4 w-4" />
                    <span>Need inspiration? View example affirmations</span>
                  </div>
                  {showExamples ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-3">
                  {AFFIRMATION_EXAMPLES.map((example, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleSelectExample(example)}
                    >
                      <p className="text-sm italic">"{example}"</p>
                      <div className="mt-2 text-right">
                        <Button size="sm" variant="ghost">
                          Select this affirmation
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
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
              disabled={!affirmation}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAffirmation}
              disabled={isSaving || !content.trim()}
            >
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

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Check, AlertTriangle, Sparkles, Plus } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

// Import the backend Go functions
import {
  AddGratitudeItem,
  GetTodayGratitudeItems,
  GetGratitudeStreak,
  CountTodayGratitudeEntries,
  GetAllGratitudeEntries,
} from "../../../wailsjs/go/backend/App";
import { toast } from "sonner";
import { GratitudeEntry, GratitudeItem } from "@/types";
import GratitudeHistory from "./gratitude-history";
import GratitudeEntries from "./gratitude-entries";

export default function GratitudePage() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [todayItems, setTodayItems] = useState<GratitudeItem[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formExpanded, setFormExpanded] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // When the todayCount changes, automatically collapse the form if we have 3+ entries
  useEffect(() => {
    if (todayCount >= 3) {
      setFormExpanded(false);
    } else {
      setFormExpanded(true);
    }
  }, [todayCount]);

  const loadData = async () => {
    try {
      // Get today's gratitude items
      const todayItemsData = await GetTodayGratitudeItems();
      setTodayItems(todayItemsData || []);

      // Get all gratitude entries
      const entriesData = await GetAllGratitudeEntries();
      setEntries(entriesData || []);

      // Get streak
      const streakData = await GetGratitudeStreak();
      setStreak(streakData);

      // Get today's count
      const countData = await CountTodayGratitudeEntries();
      setTodayCount(countData);
    } catch (error) {
      console.error("Error loading gratitude data:", error);
      toast.error("Failed to load gratitude data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate input
    if (content.trim().length < 3) {
      setError("Gratitude entry must be at least 3 characters long");
      return;
    }

    if (content.length > 500) {
      setError("Gratitude entry must be less than 500 characters");
      return;
    }

    try {
      setIsLoading(true);

      if (todayCount >= 5) {
        toast.error("You can only add up to 5 gratitude entries per day.");
        return;
      }

      // Add the new gratitude item
      await AddGratitudeItem(content);
      setContent("");

      // Reload data
      await loadData();

      toast.success("Gratitude entry added successfully.");
    } catch (error) {
      console.error("Error adding gratitude item:", error);
      toast.error("Failed to add gratitude entry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-1/2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gratitude Journal</CardTitle>
                {streak > 0 && (
                  <Badge variant="outline" className="flex gap-1 items-center">
                    <Sparkles className="h-4 w-4" />
                    {streak} day streak
                  </Badge>
                )}
              </div>
              <CardDescription>
                Record 3-5 things you're grateful for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayCount < 3 ? (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Daily gratitude incomplete</AlertTitle>
                  <AlertDescription>
                    Add at least {3 - todayCount} more entries to complete
                    today's gratitude practice.
                  </AlertDescription>
                </Alert>
              ) : todayCount >= 3 ? (
                <Alert className="mb-4">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Daily gratitude complete!</AlertTitle>
                  <AlertDescription>
                    You've added {todayCount} entries today.
                    {todayCount < 5 &&
                      ` You can add up to ${5 - todayCount} more if you'd like.`}
                  </AlertDescription>
                </Alert>
              ) : null}

              <GratitudeEntries
                todayItems={todayItems}
                setIsLoading={setIsLoading}
                loadData={loadData}
              />

              {/* Gratitude Form - Collapsible if 3+ entries */}
              {todayCount >= 3 && todayCount < 5 ? (
                <Collapsible
                  open={formExpanded}
                  onOpenChange={setFormExpanded}
                  className="border rounded-md p-4 bg-muted/50"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add more gratitude entries
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="gratitude-entry"
                          className="text-sm font-medium"
                        >
                          What else are you grateful for today?
                        </label>
                        <Textarea
                          id="gratitude-entry"
                          placeholder="I'm also grateful for..."
                          className="min-h-24"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          disabled={isLoading}
                        />
                        {error && (
                          <p className="text-sm text-destructive">{error}</p>
                        )}
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Add Entry"}
                      </Button>
                    </form>
                  </CollapsibleContent>
                </Collapsible>
              ) : todayCount >= 5 ? (
                <div className="text-center p-4 border rounded-md bg-muted/50">
                  <p className="text-muted-foreground">
                    You've reached the maximum of 5 entries for today.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="gratitude-entry"
                      className="text-sm font-medium"
                    >
                      What are you grateful for today?
                    </label>
                    <Textarea
                      id="gratitude-entry"
                      placeholder="I'm grateful for..."
                      className="min-h-24"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Share something you appreciate in your life right now.
                    </p>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Add Entry"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        <GratitudeHistory entries={entries} />
      </div>
    </div>
  );
}

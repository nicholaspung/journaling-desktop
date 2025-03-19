import React, { useState, useEffect } from "react";
import {
  GetAllAnswers,
  GetAllAffirmationLogs,
  GetAffirmationStreak,
  GetAllGratitudeEntries,
  GetGratitudeStreak,
} from "../../../wailsjs/go/backend/App";
import {
  Answer,
  AffirmationLog,
  ActivityStats,
  GratitudeEntry,
  GratitudeItem,
} from "@/types";
import ActivityCalendar from "./activity-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  CheckCircle2,
  LineChart,
  Award,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { getLocalDateString } from "@/lib/utils";
import { Button } from "../ui/button";
import DashboardSummaryCard from "../reusable/dashboard-summary-card";

const ActivityDashboard: React.FC = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [affirmationLogs, setAffirmationLogs] = useState<AffirmationLog[]>([]);
  const [gratitudeItems, setGratitudeItems] = useState<GratitudeItem[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalAnswers: 0,
    totalAffirmations: 0,
    totalAnswerDays: 0,
    totalAffirmationDays: 0,
    totalGratitudeItems: 0,
    totalGratitudeDays: 0,
    currentAffirmationStreak: 0,
    currentGratitudeStreak: 0,
    longestStreak: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);

      // Fetch answers, affirmation logs, and gratitude entries
      const answersData = (await GetAllAnswers()) || [];
      const affirmationLogsData = (await GetAllAffirmationLogs()) || [];
      const gratitudeEntriesData = (await GetAllGratitudeEntries()) || [];
      const affirmationStreak = (await GetAffirmationStreak()) || 0;
      const gratitudeStreak = (await GetGratitudeStreak()) || 0;

      setAnswers(answersData);
      setAffirmationLogs(affirmationLogsData);

      // Flatten gratitude items for easier access
      const allGratitudeItems = gratitudeEntriesData.flatMap(
        (entry) => entry.items
      );
      setGratitudeItems(allGratitudeItems);

      // Calculate statistics
      calculateStats(
        answersData,
        affirmationLogsData,
        gratitudeEntriesData,
        allGratitudeItems,
        affirmationStreak,
        gratitudeStreak
      );
    } catch (err) {
      console.error("Error fetching activity data:", err);
      setError("Failed to load activity data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    answersData: Answer[],
    affirmationLogsData: AffirmationLog[],
    gratitudeEntriesData: GratitudeEntry[],
    gratitudeItemsData: GratitudeItem[],
    affirmationStreak: number,
    gratitudeStreak: number
  ) => {
    // Get unique dates for answers
    const answerDates = new Set(
      answersData.map((answer) =>
        getLocalDateString(new Date(answer.createdAt).toISOString())
      )
    );

    // Get unique dates for affirmations
    const affirmationDates = new Set(
      affirmationLogsData.map((log) =>
        getLocalDateString(new Date(log.completedAt).toISOString())
      )
    );

    // Get unique dates for gratitude entries
    const gratitudeDates = new Set(
      gratitudeEntriesData.map((entry) => entry.date)
    );

    // Calculate total unique days with answers, affirmations, and gratitude
    const totalAnswerDays = answerDates.size;
    const totalAffirmationDays = affirmationDates.size;
    const totalGratitudeDays = gratitudeDates.size;

    // Calculate completion rates for the last 30 days
    const last30Days = new Set();
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last30Days.add(getLocalDateString(date.toISOString()));
    }

    // Count individual completion days
    let answerCompleteDays = 0;
    let affirmationCompleteDays = 0;
    let gratitudeCompleteDays = 0;

    last30Days.forEach((dateStr) => {
      if (answerDates.has(dateStr as string)) answerCompleteDays++;
      if (affirmationDates.has(dateStr as string)) affirmationCompleteDays++;
      if (gratitudeDates.has(dateStr as string)) gratitudeCompleteDays++;
    });

    // Calculate overall completion rate (average of all three)
    const completionRate = Math.round(
      ((answerCompleteDays + affirmationCompleteDays + gratitudeCompleteDays) /
        (30 * 3)) *
        100
    );

    // Determine longest streak (use the max of affirmation and gratitude streaks)
    const longestStreak = Math.max(affirmationStreak, gratitudeStreak);

    setStats({
      totalAnswers: answersData.length,
      totalAffirmations: affirmationLogsData.length,
      totalGratitudeItems: gratitudeItemsData.length,
      totalAnswerDays,
      totalAffirmationDays,
      totalGratitudeDays,
      currentAffirmationStreak: affirmationStreak,
      currentGratitudeStreak: gratitudeStreak,
      longestStreak,
      completionRate,
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get recent answers
  const getRecentAnswers = () => {
    return [...answers]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  // Get recent affirmations
  const getRecentAffirmations = () => {
    // Since we don't have direct access to the affirmation content in logs,
    // we're just showing the completion dates
    return [...affirmationLogs]
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
      .slice(0, 5);
  };

  // Get recent gratitude items
  const getRecentGratitudeItems = () => {
    return [...gratitudeItems]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading activity data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-1 mr-8"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Journal
          </Button>
        </div>

        <div className="flex-1 flex justify-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Activity Dashboard
          </h2>
        </div>

        {/* Empty div to maintain balance */}
        <div className="w-[112px]"></div>
      </div>

      {/* Calendar and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-7">
        <div className="md:col-span-4">
          <ActivityCalendar />
        </div>

        <div className="md:col-span-3 space-y-4">
          {/* Stats cards */}
          <div className="grid gap-4 grid-cols-2">
            <DashboardSummaryCard
              title="Total Answers"
              icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
              stat={stats.totalAnswers}
              description="Questions answered"
            />

            <DashboardSummaryCard
              title="Active Days"
              icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
              stat={stats.totalAnswerDays}
              description="Days with answers"
            />
          </div>

          <div className="grid gap-4 grid-cols-3">
            <DashboardSummaryCard
              title="Total Affirmations"
              icon={<Award className="h-4 w-4 text-muted-foreground" />}
              stat={stats.totalAffirmations}
              description="Completed affirmations"
            />

            <DashboardSummaryCard
              title="Total Gratitudes"
              icon={<Heart className="h-4 w-4 text-muted-foreground" />}
              stat={stats.totalGratitudeItems}
              description="Gratitude entries"
            />

            <DashboardSummaryCard
              title="Completion Rate"
              icon={<LineChart className="h-4 w-4 text-muted-foreground" />}
              stat={`${stats.completionRate}%`}
              description="Last 30 days"
            />
          </div>

          <div className="grid gap-4 grid-cols-4">
            <DashboardSummaryCard
              title="Affirmation Days"
              icon={<Award className="h-4 w-4 text-muted-foreground" />}
              stat={stats.totalAffirmationDays}
              description="Days with affirmations"
            />

            <DashboardSummaryCard
              title="Gratitude Days"
              icon={<Heart className="h-4 w-4 text-muted-foreground" />}
              stat={stats.totalGratitudeDays}
              description="Days with gratitude"
            />

            <DashboardSummaryCard
              title="Aff. Streak"
              icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
              stat={stats.currentAffirmationStreak}
              description="Affirmation days"
            />

            <DashboardSummaryCard
              title="Grat. Streak"
              icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
              stat={stats.currentGratitudeStreak}
              description="Gratitude days"
            />
          </div>

          <Card className="mb-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="answers">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="answers">Answers</TabsTrigger>
                  <TabsTrigger value="affirmations">Affirmations</TabsTrigger>
                  <TabsTrigger value="gratitude">Gratitude</TabsTrigger>
                </TabsList>

                <TabsContent value="answers" className="space-y-4 mt-4">
                  {getRecentAnswers().length > 0 ? (
                    <div className="space-y-4">
                      {getRecentAnswers().map((answer) => (
                        <div key={answer.id} className="border-b pb-2">
                          <p className="text-xs text-muted-foreground mb-1">
                            {formatDate(answer.createdAt)}
                          </p>
                          <p className="font-medium line-clamp-2">
                            {answer.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No recent answers found.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="affirmations" className="space-y-4 mt-4">
                  {getRecentAffirmations().length > 0 ? (
                    <div className="space-y-4">
                      {getRecentAffirmations().map((log) => (
                        <div key={log.id} className="border-b pb-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(log.completedAt)}
                          </p>
                          <p className="font-medium">Affirmation completed</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No recent affirmations found.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="gratitude" className="space-y-4 mt-4">
                  {getRecentGratitudeItems().length > 0 ? (
                    <div className="space-y-4">
                      {getRecentGratitudeItems().map((item) => (
                        <div key={item.id} className="border-b pb-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.entryDate)}
                          </p>
                          <p className="font-medium line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No recent gratitude entries found.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityDashboard;

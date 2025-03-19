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
import { formatDate, getLocalDateString } from "@/lib/utils";
import { Button } from "../ui/button";
import DashboardSummaryCard from "../reusable/dashboard-summary-card";
import { Brain } from "lucide-react";
import {
  GetAllCreativityEntries,
  GetCreativityStreak,
} from "../../../wailsjs/go/backend/App";
import { CreativityEntry } from "@/types";
import TrimmedContentItem from "./trimmed-content-item";

const ActivityDashboard: React.FC = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [affirmationLogs, setAffirmationLogs] = useState<AffirmationLog[]>([]);
  const [gratitudeItems, setGratitudeItems] = useState<GratitudeItem[]>([]);
  const [creativityEntries, setCreativityEntries] = useState<CreativityEntry[]>(
    []
  );
  const [stats, setStats] = useState<ActivityStats>({
    totalAnswers: 0,
    totalAffirmations: 0,
    totalAnswerDays: 0,
    totalAffirmationDays: 0,
    totalGratitudeItems: 0,
    totalGratitudeDays: 0,
    totalCreativityEntries: 0,
    totalCreativityDays: 0,
    currentAffirmationStreak: 0,
    currentGratitudeStreak: 0,
    currentCreativityStreak: 0,
    longestStreak: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityData();
  }, []);

  // Update the fetchActivityData function to include creativity entries
  const fetchActivityData = async () => {
    try {
      setLoading(true);

      // Fetch answers, affirmation logs, gratitude entries, and creativity entries
      const answersData = (await GetAllAnswers()) || [];
      const affirmationLogsData = (await GetAllAffirmationLogs()) || [];
      const gratitudeEntriesData = (await GetAllGratitudeEntries()) || [];
      const creativityEntriesData = (await GetAllCreativityEntries()) || [];
      const affirmationStreak = (await GetAffirmationStreak()) || 0;
      const gratitudeStreak = (await GetGratitudeStreak()) || 0;
      const creativityStreak = (await GetCreativityStreak()) || 0;

      setAnswers(answersData);
      setAffirmationLogs(affirmationLogsData);

      // Flatten gratitude items for easier access
      const allGratitudeItems = gratitudeEntriesData.flatMap(
        (entry) => entry.items
      );
      setGratitudeItems(allGratitudeItems);
      setCreativityEntries(creativityEntriesData);

      // Calculate statistics
      calculateStats(
        answersData,
        affirmationLogsData,
        gratitudeEntriesData,
        allGratitudeItems,
        creativityEntriesData,
        affirmationStreak,
        gratitudeStreak,
        creativityStreak
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
    creativityEntriesData: CreativityEntry[],
    affirmationStreak: number,
    gratitudeStreak: number,
    creativityStreak: number
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

    // Get unique dates for creativity entries
    const creativityDates = new Set(
      creativityEntriesData.map((entry) => entry.entryDate)
    );

    // Calculate total unique days with each activity
    const totalAnswerDays = answerDates.size;
    const totalAffirmationDays = affirmationDates.size;
    const totalGratitudeDays = gratitudeDates.size;
    const totalCreativityDays = creativityDates.size;

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
    let creativityCompleteDays = 0;

    last30Days.forEach((dateStr) => {
      if (answerDates.has(dateStr as string)) answerCompleteDays++;
      if (affirmationDates.has(dateStr as string)) affirmationCompleteDays++;
      if (gratitudeDates.has(dateStr as string)) gratitudeCompleteDays++;
      if (creativityDates.has(dateStr as string)) creativityCompleteDays++;
    });

    // Calculate overall completion rate (average of all four)
    const completionRate = Math.round(
      ((answerCompleteDays +
        affirmationCompleteDays +
        gratitudeCompleteDays +
        creativityCompleteDays) /
        (30 * 4)) *
        100
    );

    // Determine longest streak (use the max of all streaks)
    const longestStreak = Math.max(
      affirmationStreak,
      gratitudeStreak,
      creativityStreak
    );

    setStats({
      totalAnswers: answersData.length,
      totalAffirmations: affirmationLogsData.length,
      totalGratitudeItems: gratitudeItemsData.length,
      totalCreativityEntries: creativityEntriesData.length,
      totalAnswerDays,
      totalAffirmationDays,
      totalGratitudeDays,
      totalCreativityDays,
      currentAffirmationStreak: affirmationStreak,
      currentGratitudeStreak: gratitudeStreak,
      currentCreativityStreak: creativityStreak,
      longestStreak,
      completionRate,
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

  const getRecentCreativityEntries = () => {
    return [...creativityEntries]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
  };

  console.log(getRecentCreativityEntries());

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

          <div className="grid gap-4 grid-cols-4">
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
              title="Creativity Entries"
              icon={<Brain className="h-4 w-4 text-muted-foreground" />}
              stat={stats.totalCreativityEntries}
              description="Journal entries"
            />

            <DashboardSummaryCard
              title="Completion Rate"
              icon={<LineChart className="h-4 w-4 text-muted-foreground" />}
              stat={`${stats.completionRate}%`}
              description="Last 30 days"
            />
          </div>

          <div className="grid gap-4 grid-cols-3">
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
              title="Creativity Days"
              icon={<Brain className="h-4 w-4 text-muted-foreground" />}
              stat={stats.totalCreativityDays}
              description="Days with entries"
            />
          </div>

          <div className="grid gap-4 grid-cols-3">
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

            <DashboardSummaryCard
              title="Crea. Streak"
              icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
              stat={stats.currentCreativityStreak}
              description="Creativity days"
            />
          </div>

          <Card className="mb-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="answers">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="answers">Answers</TabsTrigger>
                  <TabsTrigger value="affirmations">Affirmations</TabsTrigger>
                  <TabsTrigger value="gratitude">Gratitude</TabsTrigger>
                  <TabsTrigger value="creativity">Creativity</TabsTrigger>
                </TabsList>

                <TabsContent value="answers" className="space-y-4 mt-4">
                  {getRecentAnswers().length > 0 ? (
                    <div className="space-y-4">
                      {getRecentAnswers().map((answer) => (
                        <TrimmedContentItem
                          key={answer.id}
                          id={answer.id}
                          content={answer.content}
                          date={formatDate(
                            getLocalDateString(answer.createdAt)
                          )}
                          title="Answer"
                          maxLines={2}
                        />
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
                            {formatDate(getLocalDateString(log.completedAt))}
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

                <TabsContent value="creativity" className="space-y-4 mt-4">
                  {getRecentCreativityEntries().length > 0 ? (
                    <div className="space-y-4">
                      {getRecentCreativityEntries().map((entry) => (
                        <TrimmedContentItem
                          key={entry.id}
                          id={entry.id}
                          content={entry.content}
                          date={formatDate(entry.entryDate)}
                          title="Creativity Entry"
                          maxLines={2}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No recent creativity entries found.
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

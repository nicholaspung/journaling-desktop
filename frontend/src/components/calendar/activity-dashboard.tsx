import React, { useState, useEffect } from "react";
import {
  GetAllAnswers,
  GetAllAffirmationLogs,
  GetAffirmationStreak,
} from "../../../wailsjs/go/backend/App";
import { Answer, AffirmationLog, ActivityStats } from "@/types";
import ActivityCalendar from "./activity-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, CheckCircle2, LineChart, Award } from "lucide-react";
import { getLocalDateString } from "@/lib/utils";

const ActivityDashboard: React.FC = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [affirmationLogs, setAffirmationLogs] = useState<AffirmationLog[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalAnswers: 0,
    totalAffirmations: 0,
    totalAnswerDays: 0,
    totalAffirmationDays: 0,
    currentStreak: 0,
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

      // Fetch answers and affirmation logs
      const answersData = (await GetAllAnswers()) || [];
      const affirmationLogsData = (await GetAllAffirmationLogs()) || [];
      const currentStreak = (await GetAffirmationStreak()) || 0;

      setAnswers(answersData);
      setAffirmationLogs(affirmationLogsData);

      // Calculate statistics
      calculateStats(answersData, affirmationLogsData, currentStreak);
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
    currentStreak: number
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

    // Calculate total unique days with answers and affirmations
    const totalAnswerDays = answerDates.size;
    const totalAffirmationDays = affirmationDates.size;

    // Calculate completion rate for the last 30 days
    const last30Days = new Set();
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last30Days.add(getLocalDateString(new Date().toISOString()));
    }

    console.log(last30Days);

    // Count days in the last 30 days where the user did both an affirmation and answered a question
    let completeDays = 0;
    last30Days.forEach((dateStr) => {
      if (
        answerDates.has(dateStr as string) &&
        affirmationDates.has(dateStr as string)
      ) {
        completeDays++;
      }
    });

    const completionRate = Math.round((completeDays / 30) * 100);

    // Calculate longest streak (simplified version)
    // Note: For a more accurate streak calculation, you might want to implement
    // a more sophisticated algorithm or add it to your backend
    const longestStreak = currentStreak; // Placeholder - ideally calculate this

    setStats({
      totalAnswers: answersData.length,
      totalAffirmations: affirmationLogsData.length,
      totalAnswerDays,
      totalAffirmationDays,
      currentStreak,
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
      <h2 className="text-3xl font-bold tracking-tight">Activity Dashboard</h2>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Answers</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnswers}</div>
            <p className="text-xs text-muted-foreground">Questions answered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnswerDays}</div>
            <p className="text-xs text-muted-foreground">Days with answers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Affirmations
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAffirmations}</div>
            <p className="text-xs text-muted-foreground">
              Completed affirmations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Affirmation Days
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAffirmationDays}
            </div>
            <p className="text-xs text-muted-foreground">
              Days with affirmations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-7">
        <div className="md:col-span-4">
          <ActivityCalendar />
        </div>

        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="answers">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="answers">Answers</TabsTrigger>
                  <TabsTrigger value="affirmations">Affirmations</TabsTrigger>
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
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityDashboard;

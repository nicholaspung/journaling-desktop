import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle,
  Heart,
} from "lucide-react";
import {
  GetAllAnswers,
  GetAllAffirmationLogs,
  GetAllGratitudeEntries,
} from "../../../wailsjs/go/backend/App";
import { Answer, AffirmationLog, GratitudeEntry } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, getLocalDateString } from "@/lib/utils";

const ActivityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [affirmationLogs, setAffirmationLogs] = useState<AffirmationLog[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);

      // Fetch answers, affirmation completions, and gratitude entries
      const answersData = (await GetAllAnswers()) || [];
      const affirmationLogsData = (await GetAllAffirmationLogs()) || [];
      const gratitudeEntriesData = (await GetAllGratitudeEntries()) || [];

      setAnswers(answersData);
      setAffirmationLogs(affirmationLogsData);
      setGratitudeEntries(gratitudeEntriesData);
    } catch (err) {
      console.error("Error fetching activity data:", err);
      setError("Failed to load activity data");
    } finally {
      setLoading(false);
    }
  };

  // Calendar navigation helpers
  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Get array of dates with answers (properly handled for timezone)
  const getDatesWithAnswers = () => {
    return answers.map((answer) => {
      return getLocalDateString(answer.createdAt);
    });
  };

  // Get array of dates with affirmation completions (properly handled for timezone)
  const getDatesWithAffirmations = () => {
    return affirmationLogs.map((log) => {
      return getLocalDateString(log.completedAt);
    });
  };

  // Get array of dates with gratitude entries
  const getDatesWithGratitude = () => {
    const dates = new Set<string>();

    // Extract unique dates from gratitude entries
    gratitudeEntries.forEach((entry) => {
      dates.add(entry.date);
    });

    return Array.from(dates);
  };

  // Format a date to YYYY-MM-DD in local timezone
  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;

    // Calculate total days in the current month
    const daysInMonth = lastDay.getDate();

    // Calculate total days to show (including days from prev/next months)
    const totalDaysToShow =
      Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;

    // Get dates with activities
    const datesWithAnswers = getDatesWithAnswers();
    const datesWithAffirmations = getDatesWithAffirmations();
    const datesWithGratitude = getDatesWithGratitude();

    // Generate calendar days
    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const day = prevMonthLastDay - daysFromPrevMonth + i + 1;
      const date = new Date(year, month - 1, day);
      const dateStr = formatDateString(date);

      days.push({
        date,
        dateStr,
        day,
        isCurrentMonth: false,
        hasAnswer: datesWithAnswers.includes(dateStr),
        hasAffirmation: datesWithAffirmations.includes(dateStr),
        hasGratitude: datesWithGratitude.includes(dateStr),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDateString(date);

      days.push({
        date,
        dateStr,
        day: i,
        isCurrentMonth: true,
        hasAnswer: datesWithAnswers.includes(dateStr),
        hasAffirmation: datesWithAffirmations.includes(dateStr),
        hasGratitude: datesWithGratitude.includes(dateStr),
      });
    }

    // Next month days
    const remainingDays = totalDaysToShow - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = formatDateString(date);

      days.push({
        date,
        dateStr,
        day: i,
        isCurrentMonth: false,
        hasAnswer: datesWithAnswers.includes(dateStr),
        hasAffirmation: datesWithAffirmations.includes(dateStr),
        hasGratitude: datesWithGratitude.includes(dateStr),
      });
    }

    return days;
  };

  // Find gratitude items for a specific date
  const getGratitudeItemsForDate = (dateStr: string) => {
    const entry = gratitudeEntries.find((entry) => entry.date === dateStr);
    return entry ? entry.items : [];
  };

  // Format month and year for display
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Day names for calendar header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate calendar days
  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading calendar data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Activity Calendar</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <h3 className="text-lg font-medium">{formatMonthYear()}</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Calendar header - Day names */}
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium p-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, i) => (
            <TooltipProvider key={`${day.dateStr}-${i}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square p-1 flex flex-col items-center justify-center relative",
                      "text-sm rounded-md transition-colors",
                      day.isCurrentMonth
                        ? "bg-background"
                        : "bg-muted/50 text-muted-foreground",
                      isToday(day.date) && "border border-primary"
                    )}
                  >
                    <span className="mb-1">{day.day}</span>

                    {/* Activity indicators */}
                    <div className="flex space-x-1">
                      {day.hasAnswer && (
                        <div className="text-blue-500">
                          <MessageSquare size={14} />
                        </div>
                      )}
                      {day.hasAffirmation && (
                        <div className="text-green-500">
                          <CheckCircle size={14} />
                        </div>
                      )}
                      {day.hasGratitude && (
                        <div className="text-red-500">
                          <Heart size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <p className="font-medium">
                      {day.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {day.hasAnswer || day.hasAffirmation || day.hasGratitude ? (
                      <div className="mt-1">
                        {day.hasAnswer && (
                          <div className="flex items-center text-sm">
                            <MessageSquare
                              size={12}
                              className="mr-1 text-blue-500"
                            />
                            <span>Question answered</span>
                          </div>
                        )}
                        {day.hasAffirmation && (
                          <div className="flex items-center text-sm">
                            <CheckCircle
                              size={12}
                              className="mr-1 text-green-500"
                            />
                            <span>Affirmation completed</span>
                          </div>
                        )}
                        {day.hasGratitude && (
                          <div className="flex items-center text-sm">
                            <Heart size={12} className="mr-1 text-red-500" />
                            <span>
                              Gratitude entries:{" "}
                              {getGratitudeItemsForDate(day.dateStr).length}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No activity
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <MessageSquare size={14} className="mr-1 text-blue-500" />
            <span>Question answered</span>
          </div>
          <div className="flex items-center">
            <CheckCircle size={14} className="mr-1 text-green-500" />
            <span>Affirmation completed</span>
          </div>
          <div className="flex items-center">
            <Heart size={14} className="mr-1 text-red-500" />
            <span>Gratitude entries</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to check if a date is today
function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default ActivityCalendar;

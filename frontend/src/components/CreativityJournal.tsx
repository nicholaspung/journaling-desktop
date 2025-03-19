import React, { useState, useEffect } from "react";
import { format, parse, isSameDay } from "date-fns";
import {
  CalendarIcon,
  PencilIcon,
  SaveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  EyeIcon,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  SaveCreativityEntry,
  GetCreativityEntryByDate,
  GetAllCreativityEntries,
  GetCreativityStreak,
  HasCreativityEntryForDate,
} from "../../wailsjs/go/backend/App";
import { CreativityEntry } from "@/types";
import WysiwygMarkdownEditor from "./questions/wysiwyg-markdown-editor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CREATIVITY_PROMPTS } from "@/lib/creativity-prompts";
import DeleteDialog from "@/components/reusable/delete-dialog";
import ReactMarkdown from "react-markdown";

const CreativityJournal: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const [allEntries, setAllEntries] = useState<CreativityEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [datesWithEntries, setDatesWithEntries] = useState<Date[]>([]);
  const [viewMode, setViewMode] = useState<"edit" | "view">("edit");
  const [dailyPrompt, setDailyPrompt] = useState("");

  // Dialog states
  const [discardChangesDialogOpen, setDiscardChangesDialogOpen] =
    useState(false);
  const [promptTemplateDialogOpen, setPromptTemplateDialogOpen] =
    useState(false);
  const [pendingDateChange, setPendingDateChange] = useState<Date | null>(null);

  // Format a date object to YYYY-MM-DD string
  const formatDateString = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  // Get prompt based on day of year
  const getPromptForDate = (date: Date) => {
    const dayOfYear = getDayOfYear(date);
    const promptIndex = dayOfYear % CREATIVITY_PROMPTS.length;
    return CREATIVITY_PROMPTS[promptIndex];
  };

  // Calculate day of year (1-365/366)
  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
      date.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  // Update daily prompt when selected date changes
  useEffect(() => {
    setDailyPrompt(getPromptForDate(selectedDate));
  }, [selectedDate]);

  // Load entry for the selected date
  const loadEntryForDate = async (date: Date) => {
    try {
      const dateStr = formatDateString(date);
      const hasEntry = await HasCreativityEntryForDate(dateStr);

      if (hasEntry) {
        const entry = await GetCreativityEntryByDate(dateStr);
        setContent(entry.content);
        setOriginalContent(entry.content);
        setIsDirty(false);
      } else {
        setContent("");
        setOriginalContent("");
        setIsDirty(false);
      }
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load the journal entry for the selected date.");
    }
  };

  // Load all entries and other data
  const loadAllData = async () => {
    try {
      // Get all entries
      const entries = (await GetAllCreativityEntries()) || [];
      setAllEntries(entries);

      // Create a map for quick lookups
      const entriesMap = new Map<string, CreativityEntry>();
      entries.forEach((entry) => {
        entriesMap.set(entry.entryDate, entry);
      });

      // Create dates array for the calendar
      const entryDates = entries.map((entry) =>
        parse(entry.entryDate, "yyyy-MM-dd", new Date())
      );
      setDatesWithEntries(entryDates);

      // Get streak
      const currentStreak = await GetCreativityStreak();
      setStreak(currentStreak);

      // Load the entry for the current selected date
      await loadEntryForDate(selectedDate);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load journal data.");
    }
  };

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // Load entry when date changes
  useEffect(() => {
    loadEntryForDate(selectedDate);
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Check for unsaved changes before changing the date
      if (hasUnsavedChanges) {
        setPendingDateChange(date);
        setDiscardChangesDialogOpen(true);
      } else {
        setSelectedDate(date);
      }
    }
  };

  // Execute date change after confirmation
  const confirmDateChange = async () => {
    if (pendingDateChange) {
      setSelectedDate(pendingDateChange);
      setHasUnsavedChanges(false);
      setPendingDateChange(null);
    }
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    handleDateChange(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    handleDateChange(newDate);
  };

  // Navigate to today
  const goToToday = () => {
    handleDateChange(new Date());
  };

  // Handle content changes
  const handleContentChange = (value: string) => {
    setContent(value);
    setHasUnsavedChanges(value !== originalContent);
    setIsDirty(true);
  };

  // Prepare to add prompt template
  const prepareAddPromptTemplate = () => {
    if (content) {
      setPromptTemplateDialogOpen(true);
    } else {
      addPromptTemplate();
    }
  };

  // Add prompt to editor
  const addPromptTemplate = async () => {
    const promptTemplate = `# Today's Prompt: ${dailyPrompt}

My Associations:
1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. 

Reflections:

`;

    setContent(promptTemplate);
    setHasUnsavedChanges(true);
    setIsDirty(true);
    setPromptTemplateDialogOpen(false);
  };

  // Save the current entry
  const saveEntry = async () => {
    try {
      setIsSaving(true);
      const dateStr = formatDateString(selectedDate);
      await SaveCreativityEntry(content, dateStr);

      // Refresh data
      await loadAllData();

      setHasUnsavedChanges(false);
      setIsDirty(false);
      toast.success("Journal entry saved successfully!");
      setViewMode("view");
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save the journal entry.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle between edit and view modes
  const toggleEditMode = () => {
    setContent(originalContent);
    if (viewMode === "view") {
      setViewMode("edit");
    } else {
      setViewMode("view");
    }
  };

  // Check if a date has an entry
  const hasEntryForDate = (date: Date) => {
    return datesWithEntries.some((d) => isSameDay(d, date));
  };

  return (
    <div className={`space-y-6 ${viewMode === "edit" ? "mb-12" : ""}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Creativity Journal</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex gap-1 items-center">
            <CalendarDaysIcon size={14} />
            <span>{streak} day streak</span>
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Column: Date selection and recent entries */}
        <Card className="md:w-80">
          <CardHeader>
            <CardTitle>Date Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousDay}
                title="Previous day"
              >
                <ChevronLeftIcon size={18} />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center w-full"
                  >
                    <CalendarIcon size={16} className="mr-2" />
                    {format(selectedDate, "MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    modifiers={{
                      hasEntry: datesWithEntries,
                    }}
                    modifiersClassNames={{
                      hasEntry: "bg-primary text-primary-foreground font-bold",
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNextDay}
                title="Next day"
              >
                <ChevronRightIcon size={18} />
              </Button>
            </div>

            <Button variant="secondary" className="w-full" onClick={goToToday}>
              Today
            </Button>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Recent Entries</h3>
              <div className="space-y-2">
                {allEntries.slice(0, 5).map((entry) => (
                  <Button
                    key={entry.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() =>
                      handleDateChange(
                        parse(entry.entryDate, "yyyy-MM-dd", new Date())
                      )
                    }
                  >
                    <div className="font-medium">
                      {format(
                        parse(entry.entryDate, "yyyy-MM-dd", new Date()),
                        "MMM d, yyyy"
                      )}
                    </div>
                  </Button>
                ))}

                {allEntries.length === 0 && (
                  <div className="text-sm text-muted-foreground px-2 py-1">
                    No entries yet. Start writing!
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Journal Entry and Prompt */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Daily Prompt Card */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <span className="mr-2">Today's Prompt</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                        >
                          <HelpCircle size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Write down at least 10 associations that come to mind
                          when you think of this prompt. Then reflect on these
                          associations and explore any ideas they inspire.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={prepareAddPromptTemplate}
                >
                  Use Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <h2 className="text-xl font-bold text-center">{dailyPrompt}</h2>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Write down at least 10 associations that come to mind when you
                think of this word or phrase.
              </p>
            </CardContent>
          </Card>

          {/* Journal Entry Card */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  {hasEntryForDate(selectedDate) && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Saved
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleEditMode}
                  title={viewMode === "edit" ? "View mode" : "Edit mode"}
                >
                  {viewMode === "edit" ? (
                    <EyeIcon size={18} />
                  ) : (
                    <PencilIcon size={18} />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "edit" ? (
                <WysiwygMarkdownEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Write your creative thoughts, ideas, or stories here..."
                />
              ) : (
                <div className="max-w-none min-h-[400px] border rounded-md p-4 whitespace-pre-wrap markdown-content">
                  {content ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <div className="text-muted-foreground italic">
                      No content for this date.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Absolutely positioned footer at the bottom of the screen */}
      {viewMode === "edit" && (
        <div className="fixed bottom-0 left-0 right-0 border-t py-4 px-6 bg-background shadow-md flex justify-end space-x-2 z-10">
          <Button variant="outline" onClick={toggleEditMode}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-1"
            disabled={isSaving || !isDirty}
            onClick={saveEntry}
          >
            <SaveIcon size={16} />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}

      {/* Discard Changes Dialog */}
      <DeleteDialog
        open={discardChangesDialogOpen}
        onOpenChange={setDiscardChangesDialogOpen}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to discard them?"
        onDelete={confirmDateChange}
      />

      {/* Prompt Template Dialog */}
      <DeleteDialog
        open={promptTemplateDialogOpen}
        onOpenChange={setPromptTemplateDialogOpen}
        title="Replace Content"
        description="This will replace your current content. Continue?"
        onDelete={addPromptTemplate}
      />
    </div>
  );
};

export default CreativityJournal;

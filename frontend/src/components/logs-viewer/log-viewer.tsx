import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  MessageSquare,
  CheckCircle,
  Award,
  Heart,
  Brain,
} from "lucide-react";
import {
  GetAllAffirmationLogs,
  GetAllAffirmations,
  GetAllAnswers,
  GetAllQuestions,
  UpdateQuestion,
  DeleteQuestion,
  UpdateAnswer,
  DeleteAnswer,
  UpdateAffirmation,
  DeleteAffirmation,
  DeleteAffirmationLog,
  GetAllGratitudeEntries,
  UpdateGratitudeItem,
  DeleteGratitudeItem,
  GetAllCreativityEntries,
  UpdateCreativityEntry,
  DeleteCreativityEntry,
} from "../../../wailsjs/go/backend/App";
import {
  Affirmation,
  JoinedAffirmationLog,
  JoinedAnswer,
  Question,
  TabConfig,
  GratitudeItem,
  CreativityEntry,
} from "@/types";
import DataViewer from "./data-viewer";
import DataExportImport from "./data-export-import";

const LogViewerWithDataViewer: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<JoinedAnswer[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [affirmationLogs, setAffirmationLogs] = useState<
    JoinedAffirmationLog[]
  >([]);
  const [gratitudeItems, setGratitudeItems] = useState<GratitudeItem[]>([]);
  const [creativityEntries, setCreativityEntries] = useState<CreativityEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get data from all tables
      const questionsData = (await GetAllQuestions()) || [];
      const answersData = (await GetAllAnswers()) || [];
      const affirmationsData = (await GetAllAffirmations()) || [];
      const affirmationLogsData = (await GetAllAffirmationLogs()) || [];

      // Get all gratitude entries
      const gratitudeEntriesData = (await GetAllGratitudeEntries()) || [];

      // Get all creativity entries
      const creativityEntriesData = (await GetAllCreativityEntries()) || [];

      // Flatten the gratitude entries into a single array of items
      const flattenedGratitudeItems: GratitudeItem[] = [];
      gratitudeEntriesData.forEach((entry) => {
        entry.items.forEach((item) => {
          flattenedGratitudeItems.push(item);
        });
      });

      // Create a map for quick lookups
      const questionsMap = new Map(questionsData.map((q) => [q.id, q]));
      const affirmationsMap = new Map(affirmationsData.map((a) => [a.id, a]));

      // Join data
      const joinedAnswers = answersData.map((answer) => ({
        ...answer,
        questionContent:
          questionsMap.get(answer.questionId)?.content || "Unknown Question",
      }));

      const joinedAffirmationLogs = affirmationLogsData.map((log) => ({
        ...log,
        affirmationContent:
          affirmationsMap.get(log.affirmationId)?.content ||
          "Unknown Affirmation",
      }));

      setQuestions(questionsData);
      setAnswers(joinedAnswers);
      setAffirmations(affirmationsData);
      setAffirmationLogs(joinedAffirmationLogs);
      setGratitudeItems(flattenedGratitudeItems);
      setCreativityEntries(creativityEntriesData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle import completion
  const handleImportComplete = () => {
    fetchData(); // Refresh all data after import
  };

  // Date formatting function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      // Format: "Mar 18, 2025 3:45 PM"
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

  // Define tab configurations
  const tabs: TabConfig<any>[] = [
    {
      id: "questions",
      label: "Questions",
      icon: MessageSquare,
      data: questions,
      columns: [
        { key: "id", header: "ID", filterable: false },
        { key: "content", header: "Question Content", width: "w-full" },
        { key: "createdAt", header: "Created At", filterable: false },
      ],
      idField: "id",
      contentField: "content",
      canEdit: true,
      canDelete: true,
      emptyMessage: "No questions found",
      onUpdate: async (id, content) => {
        await UpdateQuestion(id, content);
      },
      onDelete: async (id) => {
        await DeleteQuestion(id);
        setQuestions(questions.filter((q) => q.id !== id));
        // Remove associated answers
        setAnswers(answers.filter((a) => a.questionId !== id));
      },
      additionalUpdates: (id, content) => {
        // Update local state
        setQuestions(
          questions.map((q) => (q.id === id ? { ...q, content } : q))
        );
        // Also update any answer references to this question
        setAnswers(
          answers.map((a) =>
            a.questionId === id ? { ...a, questionContent: content } : a
          )
        );
      },
    },
    {
      id: "answers",
      label: "Answers",
      icon: CheckCircle,
      data: answers,
      columns: [
        { key: "id", header: "ID", filterable: false },
        {
          key: "questionContent",
          header: "Question",
          truncate: true,
          maxWidth: "max-w-[600px]",
        },
        { key: "content", header: "Answer Content", width: "w-full" },
        { key: "createdAt", header: "Created At", filterable: false },
        { key: "updatedAt", header: "Updated At", filterable: false },
      ],
      idField: "id",
      contentField: "content",
      canEdit: true,
      canDelete: true,
      emptyMessage: "No answers found",
      onUpdate: async (id, content) => {
        await UpdateAnswer(id, content);
      },
      onDelete: async (id) => {
        await DeleteAnswer(id);
        setAnswers(answers.filter((a) => a.id !== id));
      },
      additionalUpdates: (id, content) => {
        // Update local state
        setAnswers(answers.map((a) => (a.id === id ? { ...a, content } : a)));
      },
    },
    {
      id: "affirmations",
      label: "Affirmations",
      icon: Award,
      data: affirmations,
      columns: [
        { key: "id", header: "ID", filterable: false },
        { key: "content", header: "Affirmation Content", width: "w-full" },
        { key: "createdAt", header: "Created At", filterable: false },
        { key: "updatedAt", header: "Updated At", filterable: false },
      ],
      idField: "id",
      contentField: "content",
      canEdit: true,
      canDelete: true,
      emptyMessage: "No affirmations found",
      onUpdate: async (id, content) => {
        await UpdateAffirmation(id, content);
      },
      onDelete: async (id) => {
        await DeleteAffirmation(id);
        setAffirmations(affirmations.filter((a) => a.id !== id));
        // Remove associated logs
        setAffirmationLogs(
          affirmationLogs.filter((log) => log.affirmationId !== id)
        );
      },
      additionalUpdates: (id, content) => {
        // Update local state
        setAffirmations(
          affirmations.map((a) => (a.id === id ? { ...a, content } : a))
        );
        // Also update any affirmation log references
        setAffirmationLogs(
          affirmationLogs.map((log) =>
            log.affirmationId === id
              ? { ...log, affirmationContent: content }
              : log
          )
        );
      },
    },
    {
      id: "affirmation-logs",
      label: "Completion Logs",
      icon: CalendarCheck,
      data: affirmationLogs,
      columns: [
        { key: "id", header: "ID", filterable: false },
        {
          key: "affirmationContent",
          header: "Affirmation",
          truncate: true,
          width: "w-full",
          renderCell: (a) => <span>{a.affirmationContent}</span>,
        },
        { key: "completedAt", header: "Completed At", filterable: false },
      ],
      idField: "id",
      canEdit: false,
      canDelete: true,
      emptyMessage: "No affirmation logs found",
      onDelete: async (id) => {
        await DeleteAffirmationLog(id);
        setAffirmationLogs(affirmationLogs.filter((log) => log.id !== id));
      },
    },
    {
      id: "gratitude-items",
      label: "Gratitude Items",
      icon: Heart,
      data: gratitudeItems,
      columns: [
        { key: "id", header: "ID", filterable: false },
        { key: "content", header: "Gratitude Content", width: "w-full" },
        {
          key: "entryDate",
          header: "Entry Date",
          filterable: false,
          renderCell: (item) => <span>{item.entryDate}</span>,
        },
        { key: "createdAt", header: "Created At", filterable: false },
      ],
      idField: "id",
      contentField: "content",
      canEdit: true,
      canDelete: true,
      emptyMessage: "No gratitude items found",
      onUpdate: async (id, content) => {
        await UpdateGratitudeItem(id, content);
      },
      onDelete: async (id) => {
        await DeleteGratitudeItem(id);
        setGratitudeItems(gratitudeItems.filter((item) => item.id !== id));
      },
      additionalUpdates: (id, content) => {
        // Update local state
        setGratitudeItems(
          gratitudeItems.map((item) =>
            item.id === id ? { ...item, content } : item
          )
        );
      },
      defaultSortColumn: "entryDate",
      defaultSortDirection: "desc",
    },
    {
      id: "creativity-entries",
      label: "Creativity Journal",
      icon: Brain,
      data: creativityEntries,
      columns: [
        { key: "id", header: "ID", filterable: false },
        {
          key: "content",
          header: "Journal Content",
          width: "w-full",
          truncate: true,
          maxWidth: "max-w-[500px]",
        },
        {
          key: "entryDate",
          header: "Entry Date",
          filterable: false,
          renderCell: (entry) => <span>{entry.entryDate}</span>,
        },
        { key: "createdAt", header: "Created At", filterable: false },
        { key: "updatedAt", header: "Updated At", filterable: false },
      ],
      idField: "id",
      contentField: "content",
      canEdit: true,
      canDelete: true,
      emptyMessage: "No creativity journal entries found",
      onUpdate: async (id, content) => {
        await UpdateCreativityEntry(id, content);
      },
      onDelete: async (id) => {
        await DeleteCreativityEntry(id);
        setCreativityEntries(
          creativityEntries.filter((entry) => entry.id !== id)
        );
      },
      additionalUpdates: (id, content) => {
        // Update local state
        setCreativityEntries(
          creativityEntries.map((entry) =>
            entry.id === id ? { ...entry, content } : entry
          )
        );
      },
      defaultSortColumn: "entryDate",
      defaultSortDirection: "desc",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Database Management</h2>
        <DataExportImport onImportComplete={handleImportComplete} />
      </div>
      <DataViewer
        tabs={tabs}
        formatDate={formatDate}
        defaultTab="questions"
        enableSorting={true}
        enableFiltering={true}
        enablePagination={true}
        enableExport={true}
        defaultPageSize={10}
      />
    </div>
  );
};

export default LogViewerWithDataViewer;

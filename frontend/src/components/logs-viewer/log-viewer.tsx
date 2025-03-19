import React, { useState, useEffect } from "react";
import { CalendarCheck, MessageSquare, CheckCircle, Award } from "lucide-react";
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
} from "../../../wailsjs/go/backend/App";
import {
  Affirmation,
  JoinedAffirmationLog,
  JoinedAnswer,
  Question,
  TabConfig,
} from "@/types";
import DataViewer from "./data-viewer";

const LogViewerWithDataViewer: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<JoinedAnswer[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [affirmationLogs, setAffirmationLogs] = useState<
    JoinedAffirmationLog[]
  >([]);
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
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
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
          maxWidth: "max-w-[300px]",
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
  ];

  console.log(affirmationLogs);

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
  );
};

export default LogViewerWithDataViewer;

// frontend/components/LogViewer.tsx
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  CalendarCheck,
  MessageSquare,
  CheckCircle,
  Award,
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
} from "../../wailsjs/go/backend/App";
import {
  Affirmation,
  JoinedAffirmationLog,
  JoinedAnswer,
  Question,
} from "@/types";
import EditDialog from "./EditDialog";
import DeleteDialog from "./DeleteDialog";
import { toast } from "sonner";

const LogViewer: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<JoinedAnswer[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [affirmationLogs, setAffirmationLogs] = useState<
    JoinedAffirmationLog[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<{
    type: "question" | "answer" | "affirmation";
    id: number;
    content: string;
    title: string;
  } | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    type: string;
    id: number;
    title: string;
  } | null>(null);

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

  const handleEdit = (type: string, id: number, content: string) => {
    const typeMap: { [key: string]: "question" | "answer" | "affirmation" } = {
      question: "question",
      answer: "answer",
      affirmation: "affirmation",
    };

    const titleMap: { [key: string]: string } = {
      question: "Question",
      answer: "Answer",
      affirmation: "Affirmation",
    };

    if (typeMap[type]) {
      setEditItem({
        type: typeMap[type],
        id,
        content,
        title: titleMap[type],
      });
      setEditDialogOpen(true);
    }
  };

  const handleDelete = (type: string, id: number) => {
    let typeName = type.charAt(0).toUpperCase() + type.slice(1);

    if (type === "affirmation-log") {
      typeName = "Affirmation Log";
    }

    setDeleteItem({
      type,
      id,
      title: typeName,
    });
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (content: string) => {
    if (!editItem) return;

    try {
      switch (editItem.type) {
        case "question":
          await UpdateQuestion(editItem.id, content);
          // Update local state
          setQuestions(
            questions.map((q) => (q.id === editItem.id ? { ...q, content } : q))
          );

          // Also update any answer references to this question
          setAnswers(
            answers.map((a) =>
              a.questionId === editItem.id
                ? { ...a, questionContent: content }
                : a
            )
          );
          break;

        case "answer":
          await UpdateAnswer(editItem.id, content);
          // Update local state
          setAnswers(
            answers.map((a) => (a.id === editItem.id ? { ...a, content } : a))
          );
          break;

        case "affirmation":
          await UpdateAffirmation(editItem.id, content);
          // Update local state
          setAffirmations(
            affirmations.map((a) =>
              a.id === editItem.id ? { ...a, content } : a
            )
          );

          // Also update any affirmation log references
          setAffirmationLogs(
            affirmationLogs.map((log) =>
              log.affirmationId === editItem.id
                ? { ...log, affirmationContent: content }
                : log
            )
          );
          break;
      }

      toast("Updated successfully", {
        description: `The ${editItem.type} has been updated.`,
      });
    } catch (error) {
      console.error(`Error updating ${editItem.type}:`, error);
      toast("Update failed", {
        description: `Failed to update the ${editItem.type}. Please try again.`,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      switch (deleteItem.type) {
        case "question":
          await DeleteQuestion(deleteItem.id);
          // Update local state
          setQuestions(questions.filter((q) => q.id !== deleteItem.id));
          // Remove associated answers
          setAnswers(answers.filter((a) => a.questionId !== deleteItem.id));
          break;

        case "answer":
          await DeleteAnswer(deleteItem.id);
          // Update local state
          setAnswers(answers.filter((a) => a.id !== deleteItem.id));
          break;

        case "affirmation":
          await DeleteAffirmation(deleteItem.id);
          // Update local state
          setAffirmations(affirmations.filter((a) => a.id !== deleteItem.id));
          // Remove associated logs
          setAffirmationLogs(
            affirmationLogs.filter((log) => log.affirmationId !== deleteItem.id)
          );
          break;

        case "affirmation-log":
          await DeleteAffirmationLog(deleteItem.id);
          // Update local state
          setAffirmationLogs(
            affirmationLogs.filter((log) => log.id !== deleteItem.id)
          );
          break;
      }

      toast("Deleted successfully", {
        description: `The ${deleteItem.title} has been deleted.`,
      });
    } catch (error) {
      console.error(`Error deleting ${deleteItem.type}:`, error);
      toast("Delete failed", {
        description: `Failed to delete the ${deleteItem.title}. Please try again.`,
      });
    }
  };

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
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Database Log Viewer</CardTitle>
          <CardDescription>
            View and manage all your journal entries, affirmations, and activity
            logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="questions">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger
                value="questions"
                className="flex items-center gap-2"
              >
                <MessageSquare size={16} />
                Questions
              </TabsTrigger>
              <TabsTrigger value="answers" className="flex items-center gap-2">
                <CheckCircle size={16} />
                Answers
              </TabsTrigger>
              <TabsTrigger
                value="affirmations"
                className="flex items-center gap-2"
              >
                <Award size={16} />
                Affirmations
              </TabsTrigger>
              <TabsTrigger
                value="affirmation-logs"
                className="flex items-center gap-2"
              >
                <CalendarCheck size={16} />
                Completion Logs
              </TabsTrigger>
            </TabsList>

            {/* Questions Tab */}
            <TabsContent value="questions">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead className="w-full">Question Content</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No questions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>{question.id}</TableCell>
                          <TableCell>{question.content}</TableCell>
                          <TableCell>
                            {formatDate(question.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleEdit(
                                    "question",
                                    question.id,
                                    question.content
                                  )
                                }
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleDelete("question", question.id)
                                }
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Answers Tab */}
            <TabsContent value="answers">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead className="w-full">Answer Content</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {answers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No answers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      answers.map((answer) => (
                        <TableRow key={answer.id}>
                          <TableCell>{answer.id}</TableCell>
                          <TableCell>
                            <div
                              className="max-w-[200px] truncate"
                              title={answer.questionContent}
                            >
                              {answer.questionContent}
                            </div>
                          </TableCell>
                          <TableCell>{answer.content}</TableCell>
                          <TableCell>{formatDate(answer.createdAt)}</TableCell>
                          <TableCell>{formatDate(answer.updatedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleEdit(
                                    "answer",
                                    answer.id,
                                    answer.content
                                  )
                                }
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleDelete("answer", answer.id)
                                }
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Affirmations Tab */}
            <TabsContent value="affirmations">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead className="w-full">
                        Affirmation Content
                      </TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affirmations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No affirmations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      affirmations.map((affirmation) => (
                        <TableRow key={affirmation.id}>
                          <TableCell>{affirmation.id}</TableCell>
                          <TableCell>{affirmation.content}</TableCell>
                          <TableCell>
                            {formatDate(affirmation.createdAt)}
                          </TableCell>
                          <TableCell>
                            {formatDate(affirmation.updatedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleEdit(
                                    "affirmation",
                                    affirmation.id,
                                    affirmation.content
                                  )
                                }
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleDelete("affirmation", affirmation.id)
                                }
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Affirmation Logs Tab */}
            <TabsContent value="affirmation-logs">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Affirmation</TableHead>
                      <TableHead>Completed At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affirmationLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No affirmation logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      affirmationLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.id}</TableCell>
                          <TableCell>
                            <div
                              className="max-w-[400px] truncate"
                              title={log.affirmationContent}
                            >
                              {log.affirmationContent}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(log.completedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {/* Logs can only be deleted, not edited */}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleDelete("affirmation-log", log.id)
                                }
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editItem && (
        <EditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title={editItem.title}
          content={editItem.content}
          onSave={handleSaveEdit}
          type={editItem.type}
        />
      )}

      {/* Delete Dialog */}
      {deleteItem && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={`Delete ${deleteItem.title}`}
          description={`Are you sure you want to delete this ${deleteItem.title.toLowerCase()}? This action cannot be undone.`}
          onDelete={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default LogViewer;

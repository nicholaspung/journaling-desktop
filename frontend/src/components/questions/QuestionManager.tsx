import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Papa from "papaparse";
import { AddQuestion, UpdateQuestion } from "../../../wailsjs/go/backend/App";
import { toast } from "sonner";

// Define the Question type based on your Go struct
interface Question {
  id: number;
  content: string;
  createdAt: string;
}

const QuestionManager: React.FC = () => {
  // State for managing questions
  const [singleQuestion, setSingleQuestion] = useState("");
  const [multipleQuestions, setMultipleQuestions] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Handle adding a single question
  const handleAddSingleQuestion = async () => {
    if (!singleQuestion.trim()) {
      toast.error("Question content cannot be empty");
      return;
    }

    try {
      await AddQuestion(singleQuestion);
      setSingleQuestion("");
      toast.success("Question added successfully");
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    }
  };

  // Handle adding multiple questions
  const handleAddMultipleQuestions = async () => {
    if (!multipleQuestions.trim()) {
      toast.error("Questions content cannot be empty");
      return;
    }

    const questions = multipleQuestions
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (questions.length === 0) {
      toast.error("No valid questions found");
      return;
    }

    try {
      let addedCount = 0;
      for (const question of questions) {
        await AddQuestion(question);
        addedCount++;
      }

      setMultipleQuestions("");
      toast.success(`${addedCount} questions added successfully`);
    } catch (error) {
      console.error("Error adding multiple questions:", error);
      toast.error("Failed to add questions");
    }
  };

  // Handle file upload and CSV parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCSVImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      // Read the file content as text using FileReader
      const reader = new FileReader();

      reader.onload = (event) => {
        const csvText = event.target?.result as string;

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: async (results: any) => {
            const data = results.data as any[];

            // Look for a column named 'question', 'content', or the first column
            const questionColumn =
              results.meta.fields?.find(
                (field: string) =>
                  field.toLowerCase() === "question" ||
                  field.toLowerCase() === "content"
              ) || results.meta.fields?.[0];

            if (!questionColumn || data.length === 0) {
              toast.error("No valid questions found in CSV");
              setIsUploading(false);
              return;
            }

            let addedCount = 0;
            for (const row of data) {
              const question = row[questionColumn];
              if (question && typeof question === "string" && question.trim()) {
                await AddQuestion(question.trim());
                addedCount++;
              }
            }

            setSelectedFile(null);
            // Reset the file input
            const fileInput = document.getElementById(
              "csv-file"
            ) as HTMLInputElement;
            if (fileInput) fileInput.value = "";

            toast.success(`${addedCount} questions imported from CSV`);
            setIsUploading(false);
          },
          error: (error: any) => {
            console.error("CSV parsing error:", error);
            toast.error("Failed to parse CSV file");
            setIsUploading(false);
          },
        });
      };

      reader.onerror = () => {
        console.error("FileReader error");
        toast.error("Failed to read file");
        setIsUploading(false);
      };

      // Start reading the file
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error("File reading error:", error);
      toast.error("Failed to read file");
      setIsUploading(false);
    }
  };

  // Update question
  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !editContent.trim()) {
      return;
    }

    try {
      await UpdateQuestion(editingQuestion.id, editContent);
      setIsEditing(false);
      setEditingQuestion(null);
      setEditContent("");
      toast.success("Question updated successfully");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Question Manager</h1>

      <Tabs defaultValue="single" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Add Single Question</TabsTrigger>
          <TabsTrigger value="multiple">Add Multiple Questions</TabsTrigger>
          <TabsTrigger value="csv">Import from CSV</TabsTrigger>
        </TabsList>

        {/* Single Question Tab */}
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Add a Single Question</CardTitle>
              <CardDescription>
                Enter a question to add to your database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <Textarea
                  placeholder="Enter your question here..."
                  value={singleQuestion}
                  onChange={(e) => setSingleQuestion(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddSingleQuestion}>Add Question</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Multiple Questions Tab */}
        <TabsContent value="multiple">
          <Card>
            <CardHeader>
              <CardTitle>Add Multiple Questions</CardTitle>
              <CardDescription>
                Enter multiple questions, one per line
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your questions here, one per line..."
                value={multipleQuestions}
                onChange={(e) => setMultipleQuestions(e.target.value)}
                className="min-h-[200px]"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddMultipleQuestions}>
                Add Questions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* CSV Import Tab */}
        <TabsContent value="csv">
          <Card>
            <CardHeader>
              <CardTitle>Import Questions from CSV</CardTitle>
              <CardDescription>
                Upload a CSV file with questions. The file should have a column
                named 'question' or 'content'.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500">
                    Selected file: {selectedFile.name}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCSVImport}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Importing..." : "Import Questions"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Question Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the question content below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateQuestion}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionManager;

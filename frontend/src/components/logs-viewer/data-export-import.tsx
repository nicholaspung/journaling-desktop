import React, { useState, useRef } from "react";
import { Download, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import {
  GetAllAffirmationLogs,
  GetAllAffirmations,
  GetAllAnswers,
  GetAllQuestions,
  SaveAffirmation,
  AddQuestion,
  CreateNewAnswer,
  LogAffirmation,
  GetAllGratitudeEntries,
  AddGratitudeItem,
} from "../../../wailsjs/go/backend/App";
import Papa from "papaparse";
import { toast } from "sonner";

interface ExportImportProps {
  onImportComplete: () => void;
}

const DataExportImport: React.FC<ExportImportProps> = ({
  onImportComplete,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to export all data as CSV files
  const handleExportAll = async () => {
    try {
      setIsExporting(true);

      // Fetch all data from the database
      const questions = (await GetAllQuestions()) || [];
      const answers = (await GetAllAnswers()) || [];
      const affirmations = (await GetAllAffirmations()) || [];
      const affirmationLogs = (await GetAllAffirmationLogs()) || [];
      const gratitudeEntriesData = (await GetAllGratitudeEntries()) || [];

      // Flatten gratitude entries for export
      const gratitudeItems: any[] = [];
      gratitudeEntriesData.forEach((entry) => {
        entry.items.forEach((item) => {
          gratitudeItems.push(item);
        });
      });

      console.log(
        questions,
        answers,
        affirmations,
        affirmationLogs,
        gratitudeItems
      );

      // Convert data to CSV format using PapaParse
      const questionsCSV = Papa.unparse(questions);
      const answersCSV = Papa.unparse(answers);
      const affirmationsCSV = Papa.unparse(affirmations);
      const affirmationLogsCSV = Papa.unparse(affirmationLogs);
      const gratitudeItemsCSV = Papa.unparse(gratitudeItems);

      // Create a virtual link element for each CSV file and trigger download
      downloadCSV(questionsCSV, "questions.csv");
      downloadCSV(answersCSV, "answers.csv");
      downloadCSV(affirmationsCSV, "affirmations.csv");
      downloadCSV(affirmationLogsCSV, "affirmation_logs.csv");
      downloadCSV(gratitudeItemsCSV, "gratitude_items.csv");

      toast.success("All data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      setErrorMessages(["Failed to export data. Please try again."]);
      setShowErrorDialog(true);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to download CSV data
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle file selection for import
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to handle file uploads for import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Reset the input value to allow selecting the same file again
    event.target.value = "";

    const filesArray = Array.from(files);
    processImportFiles(filesArray);
  };

  // Function to process imported files
  const processImportFiles = async (files: File[]) => {
    setIsImporting(true);
    setImportProgress(0);
    setErrorMessages([]);

    try {
      const fileContents: Record<string, any[]> = {};
      const errors: string[] = [];

      // First, parse all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name.toLowerCase();

        // Skip non-CSV files
        if (!fileName.endsWith(".csv")) {
          errors.push(`${file.name} is not a CSV file. Skipping.`);
          continue;
        }

        // Determine which table this file is for
        let tableType = "";
        if (fileName.includes("question")) tableType = "questions";
        else if (fileName.includes("answer")) tableType = "answers";
        else if (fileName.includes("affirmation_log"))
          tableType = "affirmationLogs";
        else if (fileName.includes("affirmation")) tableType = "affirmations";
        else if (fileName.includes("gratitude")) tableType = "gratitudeItems";
        else {
          errors.push(
            `Could not determine data type for ${file.name}. Skipping.`
          );
          continue;
        }

        // Parse CSV file
        const content = await readFileAsText(file);
        const parseResult = Papa.parse(content, {
          header: true,
          dynamicTyping: true,
        });

        if (parseResult.errors.length > 0) {
          parseResult.errors.forEach((error) => {
            errors.push(
              `Error in ${file.name}: ${error.message} at row ${error.row}`
            );
          });
          continue;
        }

        fileContents[tableType] = parseResult.data;

        // Update progress
        setImportProgress(Math.floor(((i + 1) / files.length) * 50)); // First 50% is for parsing
      }

      // Validate the data
      const validationErrors = validateImportData(fileContents);
      if (validationErrors.length > 0) {
        setErrorMessages([...errors, ...validationErrors]);
        setShowErrorDialog(true);
        setIsImporting(false);
        return;
      }

      // If we have valid data, import it
      await importValidatedData(fileContents);

      // Show success message
      toast.success("Data imported successfully!");

      // Refresh the data in the parent component
      onImportComplete();
    } catch (error) {
      console.error("Import error:", error);
      setErrorMessages([
        "An unexpected error occurred during import. Please try again.",
      ]);
      setShowErrorDialog(true);
    } finally {
      setIsImporting(false);
      setImportProgress(100);
    }
  };

  // Helper function to read file content
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  // Function to validate imported data
  const validateImportData = (data: Record<string, any[]>): string[] => {
    const errors: string[] = [];

    // Validate questions
    if (data.questions) {
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        if (!question.content || typeof question.content !== "string") {
          errors.push(
            `Questions row ${i + 1}: Missing or invalid 'content' field`
          );
        }
      }
    }

    // Validate answers
    if (data.answers) {
      for (let i = 0; i < data.answers.length; i++) {
        const answer = data.answers[i];
        if (!answer.content || typeof answer.content !== "string") {
          errors.push(
            `Answers row ${i + 1}: Missing or invalid 'content' field`
          );
        }
        if (!answer.questionId || typeof answer.questionId !== "number") {
          errors.push(
            `Answers row ${i + 1}: Missing or invalid 'questionId' field`
          );
        }
      }
    }

    // Validate affirmations
    if (data.affirmations) {
      for (let i = 0; i < data.affirmations.length; i++) {
        const affirmation = data.affirmations[i];
        if (!affirmation.content || typeof affirmation.content !== "string") {
          errors.push(
            `Affirmations row ${i + 1}: Missing or invalid 'content' field`
          );
        }
      }
    }

    // Validate affirmation logs
    if (data.affirmationLogs) {
      for (let i = 0; i < data.affirmationLogs.length; i++) {
        const log = data.affirmationLogs[i];
        if (!log.affirmationId || typeof log.affirmationId !== "number") {
          errors.push(
            `Affirmation logs row ${i + 1}: Missing or invalid 'affirmationId' field`
          );
        }
        // Completed at is auto-generated so we don't need to validate it
      }
    }

    // Validate gratitude items
    if (data.gratitudeItems) {
      for (let i = 0; i < data.gratitudeItems.length; i++) {
        const item = data.gratitudeItems[i];
        if (!item.content || typeof item.content !== "string") {
          errors.push(
            `Gratitude items row ${i + 1}: Missing or invalid 'content' field`
          );
        }
        if (!item.entryDate || typeof item.entryDate !== "string") {
          errors.push(
            `Gratitude items row ${i + 1}: Missing or invalid 'entryDate' field`
          );
        }
      }
    }

    return errors;
  };

  // Function to import validated data
  const importValidatedData = async (data: Record<string, any[]>) => {
    const progress = 50; // Start at 50% (after parsing)
    const totalItems =
      (data.questions?.length || 0) +
      (data.affirmations?.length || 0) +
      (data.answers?.length || 0) +
      (data.affirmationLogs?.length || 0) +
      (data.gratitudeItems?.length || 0);

    let importedCount = 0;

    // Import questions first
    if (data.questions && data.questions.length > 0) {
      for (const question of data.questions) {
        await AddQuestion(question.content);
        importedCount++;
        setImportProgress(
          progress + Math.floor((importedCount / totalItems) * 50)
        );
      }
    }

    // Import affirmations
    if (data.affirmations && data.affirmations.length > 0) {
      for (const affirmation of data.affirmations) {
        await SaveAffirmation(affirmation.content);
        importedCount++;
        setImportProgress(
          progress + Math.floor((importedCount / totalItems) * 50)
        );
      }
    }

    // Import gratitude items
    if (data.gratitudeItems && data.gratitudeItems.length > 0) {
      for (const item of data.gratitudeItems) {
        // If we have a custom way to import with date, use that
        // Otherwise we'll use the default AddGratitudeItem which uses today's date
        try {
          await AddGratitudeItem(item.content);
          importedCount++;
          setImportProgress(
            progress + Math.floor((importedCount / totalItems) * 50)
          );
        } catch (error) {
          console.error("Error importing gratitude item:", error);
          // Continue with other items even if one fails
        }
      }
    }

    // Get updated questions and affirmations to map IDs
    const updatedQuestions = await GetAllQuestions();
    const updatedAffirmations = await GetAllAffirmations();

    // Create maps for quick lookups (assuming content is unique)
    const questionMap = new Map<string, number>();
    updatedQuestions.forEach((q) => questionMap.set(q.content, q.id));

    const affirmationMap = new Map<string, number>();
    updatedAffirmations.forEach((a) => affirmationMap.set(a.content, a.id));

    // Import answers (depends on questions)
    if (data.answers && data.answers.length > 0) {
      for (const answer of data.answers) {
        // Find the matching question ID
        let questionId = answer.questionId;

        // If we have the question content, try to find the new ID
        if (answer.questionContent) {
          const newId = questionMap.get(answer.questionContent);
          if (newId) questionId = newId;
        }

        if (questionId) {
          await CreateNewAnswer(questionId, answer.content);
        }

        importedCount++;
        setImportProgress(50 + Math.floor((importedCount / totalItems) * 50));
      }
    }

    // Import affirmation logs (depends on affirmations)
    if (data.affirmationLogs && data.affirmationLogs.length > 0) {
      for (const log of data.affirmationLogs) {
        // Find the matching affirmation ID
        let affirmationId = log.affirmationId;

        // If we have the affirmation content, try to find the new ID
        if (log.affirmationContent) {
          const newId = affirmationMap.get(log.affirmationContent);
          if (newId) affirmationId = newId;
        }

        if (affirmationId) {
          await LogAffirmation(affirmationId);
        }

        importedCount++;
        setImportProgress(50 + Math.floor((importedCount / totalItems) * 50));
      }
    }

    // Ensure progress is at 100%
    setImportProgress(100);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportAll}
        disabled={isExporting || isImporting}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export All"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleFileSelect}
        disabled={isExporting || isImporting}
        className="flex items-center gap-1"
      >
        <Upload className="h-4 w-4" />
        {isImporting ? "Importing..." : "Import"}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </Button>

      {isImporting && (
        <div className="flex items-center gap-2 ml-2">
          <Progress value={importProgress} className="h-2 w-24" />
          <span className="text-xs text-gray-500">{importProgress}%</span>
        </div>
      )}

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Import Failed
            </AlertDialogTitle>
            <AlertDialogDescription>
              The following errors were encountered:
              <div className="mt-2 p-3 bg-red-50 rounded-md max-h-[300px] overflow-y-auto">
                <ul className="list-disc pl-5 space-y-1">
                  {errorMessages.map((msg, idx) => (
                    <li key={idx} className="text-sm text-red-700">
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-sm">
                Please fix these issues and try importing again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataExportImport;

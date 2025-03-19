import { LucideIcon } from "lucide-react";

// src/types.ts
export interface Question {
  id: number;
  content: string;
  createdAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Affirmation {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffirmationLog {
  id: number;
  affirmationId: number;
  completedAt: string;
}

// Combined data type for the table joins
export interface JoinedAnswer extends Answer {
  questionContent?: string;
}

export interface JoinedAffirmationLog extends AffirmationLog {
  affirmationContent?: string;
}

// Types for column configuration
export type ColumnConfig<T> = {
  key: keyof T | string;
  header: string;
  width?: string;
  renderCell?: (row: T) => React.ReactNode;
  truncate?: boolean;
  maxWidth?: string;
  // New properties for enhanced features
  sortable?: boolean; // If false, column can't be sorted (default: true)
  filterable?: boolean; // If false, column won't show filter input (default: true)
  hideInExport?: boolean; // If true, column won't be included in CSV export
  renderForExport?: (row: T) => string | number; // Custom formatting for export
  skipRenderInExport?: boolean; // If true, renderCell won't be used for export
};

// Types for tab configuration
export type TabConfig<T> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  data: T[];
  columns: ColumnConfig<T>[];
  idField: keyof T;
  contentField?: keyof T;
  canEdit?: boolean;
  canDelete?: boolean;
  emptyMessage?: string;
  onUpdate?: (id: any, content: string) => Promise<void>;
  onDelete?: (id: any) => Promise<void>;
  additionalUpdates?: (id: any, content: string) => void;
  // New properties for enhanced features
  enableSorting?: boolean; // Enable/disable sorting for this tab
  enableFiltering?: boolean; // Enable/disable filtering for this tab
  enablePagination?: boolean; // Enable/disable pagination for this tab
  enableExport?: boolean; // Enable/disable export for this tab
  defaultSortColumn?: string; // Default column to sort by
  defaultSortDirection?: "asc" | "desc"; // Default sort direction
  defaultPageSize?: number; // Default page size
  pageSizeOptions?: number[]; // Available page size options
  exportFilename?: string; // Filename for export (without extension)
};

// Calendar view types
export interface CalendarDay {
  date: Date;
  dateStr: string;
  day: number;
  isCurrentMonth: boolean;
  hasAnswer: boolean;
  hasAffirmation: boolean;
}

// Updated ActivityStats interface
export interface ActivityStats {
  totalAnswers: number;
  totalAffirmations: number;
  totalGratitudeItems?: number; // New property
  totalAnswerDays: number;
  totalAffirmationDays: number;
  totalGratitudeDays?: number; // New property
  currentAffirmationStreak?: number; // Renamed from currentStreak
  currentGratitudeStreak?: number; // New property
  longestStreak: number;
  completionRate: number;
}

// Data export/import types
export interface ExportData {
  questions: Question[];
  answers: Answer[];
  affirmations: Affirmation[];
  affirmationLogs: AffirmationLog[];
  exportDate: string;
  version: string;
}

// Define types for our gratitude entries
export interface GratitudeItem {
  id: number;
  content: string;
  entryDate: string;
  createdAt: string;
}

export interface GratitudeEntry {
  date: string;
  items: GratitudeItem[];
}

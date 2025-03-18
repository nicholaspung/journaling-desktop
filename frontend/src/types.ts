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

export interface Question {
  id: number;
  content: string;
  usedOn?: string;
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

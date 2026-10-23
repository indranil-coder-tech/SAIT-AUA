export type QuestionStatus = 'pending' | 'answered' | 'hidden';

export interface Question {
  id: string;
  question: string;
  status: QuestionStatus;
  created_at: string;
  sequence_number?: number;
}

export interface SessionState {
  id: number;
  current_question_id: string | null;
  updated_at: string;
  current_question?: Question | null;
}

export interface QuestionStats {
  total: number;
  pending: number;
  answered: number;
  hidden: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SubmitQuestionPayload {
  question: string;
  honeypot?: string; // Bot protection trap
}

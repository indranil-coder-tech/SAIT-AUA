import { Question, SessionState } from "./types";
import crypto from "crypto";

// Default starter questions for demonstration when database is not yet connected
const initialQuestions: Question[] = [
  {
    id: "q-seed-1",
    question: "What kind of workshops and hackathons does SAIT host throughout the academic year?",
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    sequence_number: 1,
  },
  {
    id: "q-seed-2",
    question: "How do junior students apply to become junior core members or volunteers in SAIT?",
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    sequence_number: 2,
  },
  {
    id: "q-seed-3",
    question: "Is it difficult to balance club activities with semester end exams and assignments?",
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    sequence_number: 3,
  },
];

class MemoryStore {
  private questions: Question[] = [...initialQuestions];
  private currentQuestionId: string | null = initialQuestions[0]?.id || null;
  private updatedAt: string = new Date().toISOString();

  public getQuestions(includeHidden = false): Question[] {
    const list = includeHidden
      ? [...this.questions]
      : this.questions.filter((q) => q.status !== "hidden");

    // Assign stable sequence numbers based on created_at
    return list.map((q, idx) => ({
      ...q,
      sequence_number: idx + 1,
    }));
  }

  public getQuestionById(id: string): Question | null {
    return this.questions.find((q) => q.id === id) || null;
  }

  public addQuestion(text: string): Question {
    const newQ: Question = {
      id: crypto.randomUUID(),
      question: text,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    this.questions.push(newQ);
    return newQ;
  }

  public updateQuestionStatus(id: string, status: "pending" | "answered" | "hidden"): Question | null {
    const q = this.questions.find((item) => item.id === id);
    if (!q) return null;
    q.status = status;

    // If current question became hidden, move current selection to next pending
    if (this.currentQuestionId === id && status === "hidden") {
      const nextPending = this.questions.find((item) => item.status === "pending" && item.id !== id);
      this.currentQuestionId = nextPending ? nextPending.id : null;
      this.updatedAt = new Date().toISOString();
    }
    return q;
  }

  public deleteQuestion(id: string): boolean {
    const initialLen = this.questions.length;
    this.questions = this.questions.filter((item) => item.id !== id);
    if (this.currentQuestionId === id) {
      const nextPending = this.questions.find((item) => item.status === "pending");
      this.currentQuestionId = nextPending ? nextPending.id : null;
      this.updatedAt = new Date().toISOString();
    }
    return this.questions.length < initialLen;
  }

  public getSessionState(): SessionState {
    const currentQ = this.currentQuestionId
      ? this.questions.find((q) => q.id === this.currentQuestionId && q.status !== "hidden") || null
      : null;

    return {
      id: 1,
      current_question_id: currentQ ? currentQ.id : null,
      updated_at: this.updatedAt,
      current_question: currentQ,
    };
  }

  public setCurrentQuestion(id: string | null): SessionState {
    if (id !== null) {
      const exists = this.questions.find((q) => q.id === id && q.status !== "hidden");
      if (!exists) {
        throw new Error("Question not found or is hidden.");
      }
    }
    this.currentQuestionId = id;
    this.updatedAt = new Date().toISOString();
    return this.getSessionState();
  }

  public resetSession(): void {
    this.questions = [];
    this.currentQuestionId = null;
    this.updatedAt = new Date().toISOString();
  }
}

// Global singleton instance across Next.js reloads
const globalForStore = globalThis as unknown as { saitMemoryStore?: MemoryStore };
export const memoryStore = globalForStore.saitMemoryStore || new MemoryStore();
if (process.env.NODE_ENV !== "production") {
  globalForStore.saitMemoryStore = memoryStore;
}

import { getSupabaseServerClient, isSupabaseServerConfigured } from "./supabase/server";
import { memoryStore } from "./mock-store";
import { Question, QuestionStats, QuestionStatus, SessionState } from "./types";

/**
 * Unified data access layer.
 * Uses persistent Supabase PostgreSQL database when configured.
 * Uses in-memory fallback for local preview if Supabase keys are not yet entered.
 */

export async function fetchQuestions(options: { includeHidden?: boolean } = {}): Promise<Question[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    let query = supabase.from("questions").select("*").order("created_at", { ascending: true });
    if (!options.includeHidden) {
      query = query.in("status", ["pending", "answered"]);
    }
    const { data, error } = await query;
    if (error) {
      console.error("[db] Error fetching questions from Supabase:", error);
      throw error;
    }
    return (data || []).map((q: Question, idx: number) => ({
      ...q,
      sequence_number: idx + 1,
    }));
  }

  return memoryStore.getQuestions(options.includeHidden);
}

export async function fetchQuestionStats(): Promise<QuestionStats> {
  const questions = await fetchQuestions({ includeHidden: true });
  return {
    total: questions.length,
    pending: questions.filter((q) => q.status === "pending").length,
    answered: questions.filter((q) => q.status === "answered").length,
    hidden: questions.filter((q) => q.status === "hidden").length,
  };
}

export async function createQuestion(text: string): Promise<Question> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("questions")
      .insert({
        question: text,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("[db] Error inserting question in Supabase:", error);
      throw error;
    }
    return data;
  }

  return memoryStore.addQuestion(text);
}

export async function updateQuestionStatus(id: string, status: QuestionStatus): Promise<Question | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("questions")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[db] Error updating question status:", error);
      throw error;
    }

    // If current question became hidden, check if we need to advance or clear session_state
    if (status === "hidden") {
      const session = await fetchSessionState();
      if (session.current_question_id === id) {
        // Move to next pending or set to null
        const all = await fetchQuestions({ includeHidden: false });
        const nextPending = all.find((q) => q.status === "pending" && q.id !== id);
        await updateCurrentQuestion(nextPending ? nextPending.id : null);
      }
    }

    return data;
  }

  return memoryStore.updateQuestionStatus(id, status);
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    // If deleted question is currently selected, clear or advance it
    const session = await fetchSessionState();
    if (session.current_question_id === id) {
      const all = await fetchQuestions({ includeHidden: false });
      const nextPending = all.find((q) => q.status === "pending" && q.id !== id);
      await updateCurrentQuestion(nextPending ? nextPending.id : null);
    }

    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      console.error("[db] Error deleting question:", error);
      throw error;
    }
    return true;
  }

  return memoryStore.deleteQuestion(id);
}

export async function fetchSessionState(): Promise<SessionState> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data: sessionRow, error } = await supabase
      .from("session_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !sessionRow) {
      return {
        id: 1,
        current_question_id: null,
        updated_at: new Date().toISOString(),
        current_question: null,
      };
    }

    let currentQuestion: Question | null = null;
    if (sessionRow.current_question_id) {
      const { data: qData } = await supabase
        .from("questions")
        .select("*")
        .eq("id", sessionRow.current_question_id)
        .single();
      if (qData && qData.status !== "hidden") {
        currentQuestion = qData;
      }
    }

    return {
      id: sessionRow.id,
      current_question_id: currentQuestion ? currentQuestion.id : null,
      updated_at: sessionRow.updated_at,
      current_question: currentQuestion,
    };
  }

  return memoryStore.getSessionState();
}

export async function updateCurrentQuestion(questionId: string | null): Promise<SessionState> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase
      .from("session_state")
      .upsert({
        id: 1,
        current_question_id: questionId,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("[db] Error updating session_state:", error);
      throw error;
    }

    return fetchSessionState();
  }

  return memoryStore.setCurrentQuestion(questionId);
}

export async function navigateNextQuestion(): Promise<SessionState> {
  const allVisible = await fetchQuestions({ includeHidden: false });
  if (allVisible.length === 0) {
    return updateCurrentQuestion(null);
  }

  const session = await fetchSessionState();
  if (!session.current_question_id) {
    // If nothing currently selected, pick first pending or first visible
    const firstPending = allVisible.find((q) => q.status === "pending") || allVisible[0];
    return updateCurrentQuestion(firstPending.id);
  }

  const currentIndex = allVisible.findIndex((q) => q.id === session.current_question_id);
  if (currentIndex === -1 || currentIndex === allVisible.length - 1) {
    // Already at end or not found
    return session;
  }

  const nextQ = allVisible[currentIndex + 1];
  return updateCurrentQuestion(nextQ.id);
}

export async function navigatePreviousQuestion(): Promise<SessionState> {
  const allVisible = await fetchQuestions({ includeHidden: false });
  if (allVisible.length === 0) {
    return updateCurrentQuestion(null);
  }

  const session = await fetchSessionState();
  if (!session.current_question_id) {
    return updateCurrentQuestion(allVisible[0].id);
  }

  const currentIndex = allVisible.findIndex((q) => q.id === session.current_question_id);
  if (currentIndex <= 0) {
    // At beginning
    return session;
  }

  const prevQ = allVisible[currentIndex - 1];
  return updateCurrentQuestion(prevQ.id);
}

export async function resetSessionData(): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    // Clear session state
    await supabase
      .from("session_state")
      .upsert({ id: 1, current_question_id: null, updated_at: new Date().toISOString() });

    // Truncate or delete questions
    await supabase.from("questions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    return;
  }

  memoryStore.resetSession();
}

export function isUsingSupabaseBackend(): boolean {
  return isSupabaseServerConfigured();
}

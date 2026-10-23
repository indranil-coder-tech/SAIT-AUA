"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Maximize2, Minimize2, Tv, Radio, AlertTriangle, Layers, MessageSquare } from "lucide-react";
import { Question, SessionState } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const LOCAL_STORAGE_CACHE_KEY = "sait_display_last_synced_questions";
const LOCAL_STORAGE_SESSION_KEY = "sait_display_last_synced_session";

export default function DisplayPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "reconnecting" | "offline">("connected");
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const prevCountRef = useRef<number>(0);

  // Load from local storage cache initially for fast startup & offline resilience
  useEffect(() => {
    try {
      const cachedQ = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      const cachedS = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (cachedQ) setQuestions(JSON.parse(cachedQ));
      if (cachedS) setSession(JSON.parse(cachedS));
    } catch {
      // ignore cache read errors
    }
  }, []);

  // Fetch latest data from server
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/questions?includeHidden=false", { cache: "no-store" });
      if (!res.ok) throw new Error("Network error");
      const json = await res.json();
      if (json.success && json.data) {
        const fetchedQuestions: Question[] = json.data.questions || [];
        const fetchedSession: SessionState = json.data.session || null;

        prevCountRef.current = fetchedQuestions.length;
        setQuestions(fetchedQuestions);
        setSession(fetchedSession);
        setConnectionStatus("connected");
        setLastSyncTime(new Date().toLocaleTimeString());

        // Cache in browser storage for offline resilience
        try {
          localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(fetchedQuestions));
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(fetchedSession));
        } catch {
          // ignore cache write error
        }
      }
    } catch {
      setConnectionStatus("reconnecting");
    }
  }, []);

  // Polling fallback
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Subscribe to Supabase Realtime
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("projector_realtime_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "session_state" }, () => loadData())
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnectionStatus("connected");
        else if (status === "CLOSED" || status === "TIMED_OUT") setConnectionStatus("reconnecting");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Compute active question
  const currentQuestionId = session?.current_question_id;
  const currentQuestion = currentQuestionId
    ? questions.find((q) => q.id === currentQuestionId && q.status !== "hidden")
    : null;

  const currentSeq = currentQuestion?.sequence_number || 1;
  const formattedSeq = currentSeq < 10 ? `0${currentSeq}` : `${currentSeq}`;

  // Upcoming queue (pending questions excluding current)
  const upcomingQueue = questions.filter((q) => q.id !== currentQuestion?.id && q.status === "pending");

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal selection:bg-citrus selection:text-charcoal relative overflow-hidden">
      {/* Background Editorial Grid */}
      <div className="absolute inset-0 bg-editorial-grid opacity-30 pointer-events-none" />

      {/* Top Presentation Bar */}
      <header className="relative z-10 px-6 py-4 border-b-2 border-charcoal bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-charcoal text-citrus font-display text-2xl tracking-wider border-2 border-charcoal shadow-editorial-sm">
            SAIT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl sm:text-2xl tracking-wider text-charcoal">
                ASK US ANYTHING
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-sage/30 text-olive-dark border border-charcoal">
                STAGE MODE
              </span>
            </div>
            <p className="text-[11px] font-mono text-charcoal/70">
              AUDITORIUM PROJECTOR · LIVE STUDENT QUESTIONS
            </p>
          </div>
        </div>

        {/* Status Indicators & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ivory border-2 border-charcoal text-xs font-mono font-bold">
            <span>IN QUEUE:</span>
            <span className="bg-citrus px-2 py-0.5 rounded-full border border-charcoal text-charcoal">
              {upcomingQueue.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory border-2 border-charcoal text-xs font-mono font-bold">
            <Radio
              className={`w-3.5 h-3.5 ${
                connectionStatus === "connected"
                  ? "text-emerald-700 animate-pulse"
                  : "text-amber-700 animate-spin"
              }`}
            />
            <span>{connectionStatus === "connected" ? "LIVE" : "SYNCING"}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white hover:bg-ivory border-2 border-charcoal shadow-editorial-sm text-charcoal transition-all active:translate-x-[1px] active:translate-y-[1px]"
            title="Toggle Classroom Fullscreen (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Disconnection Warning Banner if Offline */}
      {connectionStatus !== "connected" && (
        <div className="bg-citrus/40 border-b-2 border-charcoal px-6 py-2 flex items-center justify-center gap-2 text-xs font-mono font-bold text-charcoal">
          <AlertTriangle className="w-4 h-4" />
          <span>Connection interrupted. Displaying cached session ({lastSyncTime || "recent"}).</span>
        </div>
      )}

      {/* Main 16:9 Presentation Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 lg:p-12 flex flex-col justify-between gap-8 relative z-10">
        {/* CENTERSTAGE SPOTLIGHT QUESTION */}
        <div className="flex-1 flex flex-col justify-center">
          {currentQuestion ? (
            <div className="w-full bg-white rounded-3xl border-4 border-charcoal p-8 sm:p-12 lg:p-16 shadow-editorial-xl transition-all animate-in fade-in zoom-in-95 duration-300">
              {/* Question Sequence Tag */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b-2 border-charcoal">
                <div className="flex items-center gap-3">
                  <span className="font-display text-4xl sm:text-5xl font-black text-charcoal leading-none">
                    QUESTION {formattedSeq}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-citrus text-charcoal border-2 border-charcoal font-mono text-xs font-bold uppercase tracking-wider shadow-editorial-sm">
                    NOW DISCUSSING
                  </span>
                </div>

                <span className="font-mono text-xs font-bold uppercase tracking-widest text-charcoal/70">
                  STUDENT ASSOCIATION OF IT · GIM 2025
                </span>
              </div>

              {/* Massive High-Contrast Question Typography */}
              <div className="min-h-[160px] flex items-center">
                <blockquote className="text-3xl sm:text-5xl lg:text-6xl font-black text-charcoal leading-[1.12] tracking-tight font-sans break-words">
                  &ldquo;{currentQuestion.question}&rdquo;
                </blockquote>
              </div>

              {/* Bottom Subtle Signature */}
              <div className="mt-8 pt-6 border-t-2 border-charcoal/20 flex items-center justify-between font-mono text-xs text-charcoal/70 font-bold uppercase tracking-widest">
                <span>ANONYMOUS SUBMISSION</span>
                <span>NO FILTER · HONEST SENIOR ANSWERS</span>
              </div>
            </div>
          ) : (
            /* Waiting State Card */
            <div className="w-full bg-white rounded-3xl border-4 border-charcoal p-12 sm:p-20 text-center shadow-editorial-xl space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-sage/30 border-3 border-charcoal flex items-center justify-center mx-auto shadow-editorial">
                <MessageSquare className="w-10 h-10 text-charcoal" />
              </div>

              <div className="space-y-3 max-w-xl mx-auto">
                <span className="px-3 py-1 rounded-full bg-citrus text-charcoal border border-charcoal font-mono text-xs font-bold uppercase tracking-widest">
                  STAGE READY
                </span>
                <h2 className="font-display text-5xl sm:text-6xl font-black text-charcoal leading-none">
                  {questions.length === 0
                    ? "WAITING FOR FIRST QUESTION"
                    : "READY FOR NEXT QUESTION"}
                </h2>
                <p className="text-base sm:text-lg font-bold text-olive-dark">
                  {questions.length === 0
                    ? "Scan the QR code on the screen or visit /submit on your mobile phone to ask your question!"
                    : `${upcomingQueue.length} question(s) in queue. The organizer will spotlight the next question shortly.`}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ivory border-2 border-charcoal font-mono text-xs font-bold uppercase">
                <span>Scan QR or visit</span>
                <span className="bg-citrus px-2 py-0.5 rounded border border-charcoal">/submit</span>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM DOCK: UPCOMING IN QUEUE */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-charcoal/80 px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-tangerine" />
              <span>UP NEXT IN QUEUE ({upcomingQueue.length})</span>
            </div>
            <span>CONTROLLED LIVE FROM ADMIN PANEL</span>
          </div>

          {upcomingQueue.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/70 border-2 border-charcoal/30 text-center font-mono text-xs text-charcoal/60">
              No additional pending questions in queue right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingQueue.slice(0, 3).map((q, idx) => (
                <div
                  key={q.id}
                  className="editorial-box rounded-2xl p-4 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="bg-sage/40 px-2 py-0.5 rounded-full border border-charcoal">
                      #{q.sequence_number || idx + 1}
                    </span>
                    <span className="text-[10px] text-charcoal/60">PENDING</span>
                  </div>
                  <p className="text-sm font-bold text-charcoal line-clamp-2">
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Presentation Footer */}
      <footer className="px-6 py-3 bg-white border-t-2 border-charcoal flex items-center justify-between font-mono text-xs text-charcoal/70">
        <span>SAIT · GENERAL INTRODUCTORY MEETING (GIM 2025)</span>
        <span className="hidden sm:inline">PRESS F11 FOR FULLSCREEN PRESENTATION</span>
      </footer>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Maximize2, Minimize2, Tv, Sparkles, MessageSquare, AlertTriangle, Wifi, WifiOff, Layers } from "lucide-react";
import { SpatialBackground } from "@/components/spatial/SpatialBackground";
import { Header } from "@/components/navigation/Header";
import { SpatialCard } from "@/components/spatial/SpatialCard";
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
  const [newQuestionCue, setNewQuestionCue] = useState(false);
  const prevCountRef = useRef<number>(0);

  // Load from local storage cache initially for fast startup & offline resilience
  useEffect(() => {
    try {
      const cachedQ = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      const cachedS = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (cachedQ) setQuestions(JSON.parse(cachedQ));
      if (cachedS) setSession(JSON.parse(cachedS));
    } catch (e) {
      console.warn("Could not read local cache:", e);
    }
  }, []);

  // Fetch latest data from server
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/questions?includeHidden=false", { cache: "no-store" });
      if (!res.ok) throw new Error("Network response error");
      const json = await res.json();
      if (json.success && json.data) {
        const fetchedQuestions: Question[] = json.data.questions || [];
        const fetchedSession: SessionState = json.data.session || null;

        // Visual cue if question count increased
        if (prevCountRef.current > 0 && fetchedQuestions.length > prevCountRef.current) {
          setNewQuestionCue(true);
          setTimeout(() => setNewQuestionCue(false), 3000);
        }
        prevCountRef.current = fetchedQuestions.length;

        setQuestions(fetchedQuestions);
        setSession(fetchedSession);
        setConnectionStatus("connected");
        setLastSyncTime(new Date().toLocaleTimeString());

        // Cache in browser storage for resilience
        try {
          localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(fetchedQuestions));
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(fetchedSession));
        } catch {
          // ignore storage write errors
        }
      }
    } catch {
      setConnectionStatus("reconnecting");
    }
  }, []);

  // Polling fallback + initial fetch
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000); // Poll as a robust fallback
    return () => clearInterval(interval);
  }, [loadData]);

  // Subscribe to Supabase Realtime when credentials are configured
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("display_realtime_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "questions" },
        () => {
          loadData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "session_state" },
        () => {
          loadData();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CLOSED" || status === "TIMED_OUT") {
          setConnectionStatus("reconnecting");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Toggle Fullscreen mode
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

  // Compute active highlighted question
  const currentQuestionId = session?.current_question_id;
  const currentQuestion = currentQuestionId
    ? questions.find((q) => q.id === currentQuestionId && q.status !== "hidden")
    : null;

  // Compute upcoming questions queue (pending questions excluding current)
  const upcomingQuestions = questions.filter(
    (q) => q.id !== currentQuestion?.id && q.status === "pending"
  );

  const answeredCount = questions.filter((q) => q.status === "answered").length;

  return (
    <div className="min-h-screen flex flex-col bg-midnight-950 text-white selection:bg-cyan-500 selection:text-black">
      <SpatialBackground />

      {/* Presentation Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-midnight-950/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-spatial-glow border border-white/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-violet-300">
                SAIT ASK US ANYTHING
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold tracking-wider">
                LIVE PROJECTOR
              </span>
            </div>
            <p className="text-xs text-slate-400">GIM Interactive Q&A Session • Realtime Student Forum</p>
          </div>
        </div>

        {/* Live Counters & Controls */}
        <div className="flex items-center gap-3">
          {/* Question Stats Pills */}
          <div className="hidden md:flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-midnight-900/90 border border-white/10 flex items-center gap-2 text-xs">
              <span className="text-slate-400">Total Received:</span>
              <span className="font-bold font-mono text-cyan-300">{questions.length}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-midnight-900/90 border border-white/10 flex items-center gap-2 text-xs">
              <span className="text-slate-400">Answered:</span>
              <span className="font-bold font-mono text-emerald-400">{answeredCount}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-midnight-900/90 border border-white/10 flex items-center gap-2 text-xs">
              <span className="text-slate-400">Queue:</span>
              <span className="font-bold font-mono text-violet-300">{upcomingQuestions.length}</span>
            </div>
          </div>

          {/* New Question Incoming Notification Badge */}
          {newQuestionCue && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/30 border border-violet-400 text-violet-200 text-xs font-semibold animate-pulse shadow-spatial-glow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Question In!</span>
            </div>
          )}

          {/* Realtime Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-midnight-900/90 border border-white/10 text-xs font-mono">
            {connectionStatus === "connected" ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            )}
            <span className={connectionStatus === "connected" ? "text-emerald-400" : "text-amber-400"}>
              {connectionStatus === "connected" ? "LIVE" : "RECONNECTING"}
            </span>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium transition-all active:scale-95"
            title="Toggle Classroom Fullscreen (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </header>

      {/* Offline Stale Data Warning Banner */}
      {connectionStatus !== "connected" && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-center gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4" />
          <span>
            Realtime connection momentarily interrupted. Displaying last-synced cache ({lastSyncTime || "recent"}). Questions will update automatically once reconnected.
          </span>
        </div>
      )}

      {/* Main Classroom Projection Area (16:9 Aspect Ratio Optimized) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between gap-6">
        {/* CURRENT HIGHLIGHTED QUESTION HERO */}
        <div className="flex-1 flex flex-col justify-center">
          {currentQuestion ? (
            <SpatialCard
              glow="cyan"
              className="w-full p-8 sm:p-12 lg:p-16 border-2 border-cyan-400/40 shadow-spatial-projector transition-all duration-500 animate-in fade-in zoom-in-95"
              enableTilt={false}
            >
              <div className="flex flex-col gap-6">
                {/* Meta Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-sm sm:text-base font-extrabold tracking-widest shadow-sm">
                      QUESTION #{currentQuestion.sequence_number || 1}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider border border-violet-500/30">
                      Now Discussing
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Anonymous Student Submission
                  </span>
                </div>

                {/* Big High-Contrast Readable Question Typography */}
                <div className="min-h-[140px] flex items-center">
                  <blockquote className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight sm:leading-snug tracking-tight text-glow-cyan break-words">
                    &ldquo;{currentQuestion.question}&rdquo;
                  </blockquote>
                </div>
              </div>
            </SpatialCard>
          ) : (
            /* Waiting State when no question is currently highlighted */
            <SpatialCard
              glow="violet"
              className="w-full p-10 sm:p-16 text-center border-dashed border-violet-500/30"
              enableTilt={false}
            >
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-500/30 border border-violet-400/40 flex items-center justify-center text-violet-300 mb-6 shadow-spatial-glow">
                <MessageSquare className="w-10 h-10 animate-pulse-subtle" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                {questions.length === 0
                  ? "Waiting for the First Student Question..."
                  : "Ready for the Next Question"}
              </h2>
              <p className="text-slate-300 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-6">
                {questions.length === 0
                  ? "Scan the QR code on your phone to submit anonymous questions. They will appear live on this screen!"
                  : `${upcomingQuestions.length} question(s) in queue. The organizer will select the next question shortly.`}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-midnight-900/80 border border-white/10 text-cyan-300 font-mono text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Visit /submit on your device to participate</span>
              </div>
            </SpatialCard>
          )}
        </div>

        {/* LIVE QUEUE BOTTOM DOCK */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Up Next in Queue ({upcomingQuestions.length})</span>
            </div>
            <span>Controlled live from Admin Panel</span>
          </div>

          {upcomingQuestions.length === 0 ? (
            <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5 text-center text-xs text-slate-500">
              No additional pending questions in queue right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
              {upcomingQuestions.slice(0, 3).map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-midnight-900/70 border border-white/10 flex flex-col justify-between gap-2 shadow-sm transition-all hover:border-violet-500/30"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-violet-300">
                      #{q.sequence_number || idx + 1}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 font-medium">
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 py-3 border-t border-white/10 bg-midnight-950/80 flex items-center justify-between text-xs text-slate-500">
        <span>Student Association of Information Technology (SAIT) • Classroom Projector Mode</span>
        <span>Press F11 for Fullscreen Presentation</span>
      </footer>
    </div>
  );
}

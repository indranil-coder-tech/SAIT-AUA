"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Lock,
  Unlock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  EyeOff,
  Eye,
  Trash2,
  RefreshCw,
  Download,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { SpatialBackground } from "@/components/spatial/SpatialBackground";
import { Header } from "@/components/navigation/Header";
import { SpatialCard } from "@/components/spatial/SpatialCard";
import { QRCodeCard } from "@/components/qr/QRCodeCard";
import { Question, SessionState, QuestionStatus } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard Data State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "answered" | "hidden">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Check auth status on load
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const json = await res.json();
      setIsAuthenticated(Boolean(json.authenticated));
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Load questions and session state
  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);
      const res = await fetch("/api/questions?includeHidden=true", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setQuestions(json.data.questions || []);
        setSession(json.data.session || null);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 3500);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadData]);

  // Supabase Realtime Subscription for instant admin updates
  useEffect(() => {
    if (!isAuthenticated) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin_realtime_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, () => {
        loadData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "session_state" }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, loadData]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim() || loggingIn) return;

    setLoggingIn(true);
    setPinError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Authentication failed. Invalid PIN.");
      }

      setIsAuthenticated(true);
      setPinInput("");
    } catch (err: unknown) {
      setPinError(err instanceof Error ? err.message : "Authentication error.");
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Presenter Controls (Next, Prev, Clear, Set)
  const handleSessionAction = async (action: "next" | "prev" | "clear" | "set", questionId?: string | null) => {
    try {
      setActionLoading(action);
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, questionId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
      }
    } catch (err) {
      console.error("Session action error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Update Question Status (Answered / Hidden / Pending)
  const handleUpdateStatus = async (id: string, status: QuestionStatus) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        await loadData();
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setDeleteConfirmId(null);
        await loadData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Reset Session
  const handleResetSession = async () => {
    try {
      setActionLoading("reset");
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const json = await res.json();
      if (json.success) {
        setResetModalOpen(false);
        await loadData();
      }
    } catch (err) {
      console.error("Reset session error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Export Backups
  const handleExport = (format: "json" | "csv") => {
    window.open(`/api/admin/export?format=${format}`, "_blank");
  };

  // If checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight-950 text-white">
        <SpatialBackground />
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-sm text-slate-400">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PIN LOGIN SCREEN (IF NOT AUTHENTICATED)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-midnight-950 text-white">
        <SpatialBackground />
        <Header />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <SpatialCard glow="violet" className="max-w-md w-full p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-spatial-glow">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">SAIT Organizer Login</h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative PIN to manage the live Ask Us Anything session.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-pin" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Admin Security PIN
                </label>
                <input
                  id="admin-pin"
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter secret PIN (e.g. sait2025)"
                  className="w-full px-4 py-3 rounded-xl bg-midnight-900 border border-white/10 text-white placeholder:text-slate-600 text-center tracking-widest text-lg font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn || !pinInput}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-spatial-glow hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Access Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-[11px] text-slate-500 font-mono">
                Protected by server-side HttpOnly signed session cookies.
              </p>
            </div>
          </SpatialCard>
        </main>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED ORGANIZER DASHBOARD
  // =========================================================================
  const totalCount = questions.length;
  const pendingCount = questions.filter((q) => q.status === "pending").length;
  const answeredCount = questions.filter((q) => q.status === "answered").length;
  const hiddenCount = questions.filter((q) => q.status === "hidden").length;

  const currentQId = session?.current_question_id;
  const currentQ = currentQId ? questions.find((q) => q.id === currentQId) : null;

  // Filtered and searched questions
  const filteredQuestions = questions.filter((q) => {
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      return q.question.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-midnight-950 text-white">
      <SpatialBackground />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Bar with Organizer Info, Logout, & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">Organizer Control Panel</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  AUTHENTICATED
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage live classroom projector sequence & moderation</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={loadingData}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
              title="Refresh questions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export CSV / JSON */}
            <button
              onClick={() => handleExport("csv")}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => handleExport("json")}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            {/* Reset Session */}
            <button
              onClick={() => setResetModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Session</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white transition-all ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/10 flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Submitted</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">{totalCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/80 border border-cyan-500/30 flex flex-col">
            <span className="text-xs text-cyan-300 uppercase tracking-wider font-semibold">Pending Queue</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono mt-1">{pendingCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/80 border border-emerald-500/30 flex flex-col">
            <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">Answered</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">{answeredCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/80 border border-rose-500/30 flex flex-col">
            <span className="text-xs text-rose-300 uppercase tracking-wider font-semibold">Hidden / Spam</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono mt-1">{hiddenCount}</span>
          </div>
        </div>

        {/* PRESENTER NAVIGATION HERO BAR */}
        <SpatialCard glow="cyan" className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Currently Live on Projector:
                </span>
                {currentQ && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200">
                    #{currentQ.sequence_number || 1}
                  </span>
                )}
              </div>
              <p className="text-base sm:text-lg font-bold text-white line-clamp-2">
                {currentQ ? `"${currentQ.question}"` : "No question currently highlighted on projector screen"}
              </p>
            </div>

            {/* Navigation Buttons: Previous, Next, Clear */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => handleSessionAction("prev")}
                disabled={actionLoading === "prev"}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-white/10 text-white font-medium text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => handleSessionAction("next")}
                disabled={actionLoading === "next"}
                className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {currentQ && (
                <button
                  onClick={() => handleSessionAction("clear")}
                  disabled={actionLoading === "clear"}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs transition-all active:scale-95"
                  title="Clear Projector Spotlight (Shows waiting state)"
                >
                  Clear Screen
                </button>
              )}
            </div>
          </div>
        </SpatialCard>

        {/* TWO-COLUMN GRID: QUESTION MANAGEMENT & QR CODE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: QUESTION LIST */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Tabs and Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-midnight-900/60 border border-white/10">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
                {(["all", "pending", "answered", "hidden"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                      filterStatus === tab
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Questions Table / Card List */}
            {filteredQuestions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-midnight-900/40 border border-white/5 text-slate-400 text-sm">
                No questions found matching the selected filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((q) => {
                  const isCurrent = session?.current_question_id === q.id;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-violet-950/40 border-cyan-400 shadow-spatial-cyan"
                          : "bg-midnight-900/70 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-300">
                              #{q.sequence_number || "?"}
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                q.status === "pending"
                                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                                  : q.status === "answered"
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {q.status}
                            </span>

                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold uppercase">
                                ON SCREEN
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-slate-100 font-medium break-words leading-relaxed">
                            {q.question}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* Show on Projector */}
                          <button
                            onClick={() => handleSessionAction("set", q.id)}
                            disabled={isCurrent}
                            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                              isCurrent
                                ? "bg-cyan-500/20 text-cyan-300 cursor-default"
                                : "bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                            }`}
                            title="Show this question on projector"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Project</span>
                          </button>

                          {/* Mark as Answered */}
                          {q.status !== "answered" && (
                            <button
                              onClick={() => handleUpdateStatus(q.id, "answered")}
                              className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 transition-all"
                              title="Mark as Answered"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Hide / Unhide */}
                          {q.status === "hidden" ? (
                            <button
                              onClick={() => handleUpdateStatus(q.id, "pending")}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
                              title="Restore question"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(q.id, "hidden")}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-amber-300 transition-all"
                              title="Hide question from projector"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Question */}
                          <button
                            onClick={() => setDeleteConfirmId(q.id)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                            title="Delete question permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DOWNLOADABLE QR CODE CARD */}
          <div className="space-y-6">
            <QRCodeCard />
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <SpatialCard glow="none" className="max-w-md w-full p-6 bg-midnight-900 border-rose-500/40">
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Delete Question?</h3>
              </div>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                Are you sure you want to permanently delete this question? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteQuestion(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Confirm Delete
                </button>
              </div>
            </SpatialCard>
          </div>
        )}

        {/* RESET SESSION CONFIRMATION MODAL */}
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <SpatialCard glow="none" className="max-w-md w-full p-6 bg-midnight-900 border-rose-500/40">
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Reset Entire Session?</h3>
              </div>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                This will clear all submitted questions and reset the projector spotlight.
                Make sure you have exported a CSV/JSON backup if you wish to retain previous records.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetSession}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </SpatialCard>
          </div>
        )}
      </main>
    </div>
  );
}

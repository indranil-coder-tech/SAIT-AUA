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
import { Header } from "@/components/navigation/Header";
import { QRCodeCard } from "@/components/qr/QRCodeCard";
import { Question, SessionState, QuestionStatus } from "@/lib/types";
import { useQuestionSync, broadcastSyncEvent } from "@/lib/sync";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Synchronized questions queue & session state
  const {
    questions,
    session,
    loading: loadingData,
    refresh: loadData,
    setSession,
  } = useQuestionSync({
    includeHidden: true,
    enabled: isAuthenticated === true,
    pollingIntervalMs: 8000,
  });

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
        broadcastSyncEvent("SESSION_UPDATED");
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
        broadcastSyncEvent("STATUS_UPDATED");
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
        broadcastSyncEvent("QUESTION_DELETED");
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
        broadcastSyncEvent("SESSION_RESET");
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

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory text-charcoal">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-olive animate-spin" />
          <p className="font-mono text-xs uppercase tracking-wider">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PIN LOGIN SCREEN (IF NOT AUTHENTICATED)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-ivory text-charcoal">
        <Header />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="editorial-box max-w-md w-full p-8 rounded-3xl bg-white space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-citrus border-2 border-charcoal flex items-center justify-center text-charcoal mx-auto shadow-editorial-sm">
                <Lock className="w-8 h-8" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-olive bg-sage/20 px-3 py-1 rounded-full border border-charcoal/20">
                SECURITY GATE
              </span>
              <h1 className="font-display text-4xl font-black text-charcoal leading-none">
                ORGANIZER ACCESS
              </h1>
              <p className="text-xs font-mono text-charcoal/70">
                Enter your administrative PIN to manage the live Ask Us Anything session.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-pin"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-charcoal mb-2"
                >
                  Admin PIN
                </label>
                <input
                  id="admin-pin"
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter admin PIN"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-ivory border-2 border-charcoal text-charcoal placeholder:text-charcoal/40 text-center tracking-widest text-xl font-mono font-bold focus:outline-none focus:ring-4 focus:ring-citrus/40 uppercase"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-100 border-2 border-rose-600 text-rose-900 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn || !pinInput}
                className="btn-editorial-tangerine w-full py-4 px-6 rounded-xl text-base uppercase tracking-wider shadow-editorial transition-all flex items-center justify-center gap-2 disabled:opacity-40"
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

            <div className="pt-4 border-t border-charcoal/15 text-center">
              <p className="text-[10px] font-mono text-charcoal/60">
                Protected by signed HttpOnly session cookies. Server-verified.
              </p>
            </div>
          </div>
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

  const filteredQuestions = questions.filter((q) => {
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      return q.question.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal selection:bg-citrus selection:text-charcoal">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Editorial Control Header */}
        <div className="editorial-box rounded-3xl p-5 sm:p-6 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-citrus border-2 border-charcoal flex items-center justify-center text-charcoal shadow-editorial-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-black text-charcoal leading-none">
                  ORGANIZER DASHBOARD
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-sage/30 text-olive-dark border border-charcoal">
                  AUTHENTICATED
                </span>
              </div>
              <p className="text-xs font-mono text-charcoal/70">
                SAIT GIM Session · Live Projector Moderation & Sequence Control
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadData}
              disabled={loadingData}
              className="px-3 py-2 rounded-xl bg-ivory hover:bg-citrus/30 border-2 border-charcoal font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5"
              title="Refresh questions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => handleExport("csv")}
              className="px-3 py-2 rounded-xl bg-ivory hover:bg-citrus/30 border-2 border-charcoal font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => handleExport("json")}
              className="px-3 py-2 rounded-xl bg-ivory hover:bg-citrus/30 border-2 border-charcoal font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={() => setResetModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 border-2 border-charcoal text-rose-900 font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Session</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-ivory hover:bg-rose-100 border-2 border-charcoal text-charcoal transition-all ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="editorial-box rounded-2xl p-5 bg-white flex flex-col justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-charcoal/70">
              TOTAL SUBMITTED
            </span>
            <span className="font-display text-4xl sm:text-5xl font-black text-charcoal mt-1">
              {totalCount}
            </span>
          </div>

          <div className="editorial-box rounded-2xl p-5 bg-citrus/30 flex flex-col justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-charcoal">
              PENDING QUEUE
            </span>
            <span className="font-display text-4xl sm:text-5xl font-black text-charcoal mt-1">
              {pendingCount}
            </span>
          </div>

          <div className="editorial-box rounded-2xl p-5 bg-sage/30 flex flex-col justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-olive-dark">
              ANSWERED
            </span>
            <span className="font-display text-4xl sm:text-5xl font-black text-olive-dark mt-1">
              {answeredCount}
            </span>
          </div>

          <div className="editorial-box rounded-2xl p-5 bg-tangerine/30 flex flex-col justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-tangerine-dark">
              HIDDEN / SPAM
            </span>
            <span className="font-display text-4xl sm:text-5xl font-black text-tangerine-dark mt-1">
              {hiddenCount}
            </span>
          </div>
        </div>

        {/* PRESENTER NAVIGATION BAR */}
        <div className="editorial-box rounded-3xl p-6 bg-citrus/20 border-3 border-charcoal">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal">
                  CURRENTLY ON PROJECTOR:
                </span>
                {currentQ && (
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-charcoal text-citrus">
                    #{currentQ.sequence_number || 1}
                  </span>
                )}
              </div>
              <p className="text-lg sm:text-xl font-bold text-charcoal line-clamp-2">
                {currentQ ? `"${currentQ.question}"` : "No question currently highlighted on projector"}
              </p>
            </div>

            {/* Navigation Buttons: Previous, Next, Clear */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() => handleSessionAction("prev")}
                disabled={actionLoading === "prev"}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-ivory border-2 border-charcoal font-mono text-xs font-bold uppercase tracking-wider shadow-editorial-sm transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => handleSessionAction("next")}
                disabled={actionLoading === "next"}
                className="btn-editorial-tangerine px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-editorial flex items-center gap-1 disabled:opacity-50"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {currentQ && (
                <button
                  onClick={() => handleSessionAction("clear")}
                  disabled={actionLoading === "clear"}
                  className="px-3 py-2.5 rounded-xl bg-white hover:bg-ivory border-2 border-charcoal font-mono text-xs font-bold uppercase tracking-wider text-charcoal transition-all"
                  title="Clear Projector Spotlight (Shows waiting state)"
                >
                  Clear Screen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TWO-COLUMN GRID: QUESTION MANAGEMENT & QR CODE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: QUESTION LIST */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Tabs & Search Box */}
            <div className="editorial-box rounded-2xl p-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-charcoal/60 ml-1" />
                {(["all", "pending", "answered", "hidden"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                      filterStatus === tab
                        ? "bg-charcoal text-citrus shadow-sm"
                        : "text-charcoal/70 hover:bg-ivory"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-charcoal/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-ivory border border-charcoal/30 font-mono text-xs text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal"
                />
              </div>
            </div>

            {/* Questions List */}
            {filteredQuestions.length === 0 ? (
              <div className="editorial-box rounded-3xl p-12 text-center bg-white font-mono text-xs text-charcoal/60">
                No questions found matching the selected filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((q) => {
                  const isCurrent = session?.current_question_id === q.id;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border-2 border-charcoal p-4 transition-all ${
                        isCurrent
                          ? "bg-citrus shadow-editorial-lg -translate-y-0.5"
                          : "bg-white hover:bg-ivory-50 shadow-editorial-sm"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-charcoal bg-charcoal/10 px-2 py-0.5 rounded-full">
                              #{q.sequence_number || "?"}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border border-charcoal/30 ${
                                q.status === "pending"
                                  ? "bg-citrus/40 text-charcoal"
                                  : q.status === "answered"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-rose-100 text-rose-900"
                              }`}
                            >
                              {q.status}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-charcoal text-citrus">
                                ON SCREEN
                              </span>
                            )}
                          </div>
                          <p className="text-base font-bold text-charcoal leading-snug break-words">
                            {q.question}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => handleSessionAction("set", q.id)}
                            disabled={isCurrent}
                            className={`p-2 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1 transition-all ${
                              isCurrent
                                ? "bg-charcoal text-citrus cursor-default"
                                : "bg-ivory hover:bg-citrus border border-charcoal text-charcoal"
                            }`}
                            title="Show on projector"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Project</span>
                          </button>

                          {q.status !== "answered" && (
                            <button
                              onClick={() => handleUpdateStatus(q.id, "answered")}
                              className="p-2 rounded-lg bg-ivory hover:bg-emerald-100 border border-charcoal text-emerald-800 transition-all"
                              title="Mark as Answered"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {q.status === "hidden" ? (
                            <button
                              onClick={() => handleUpdateStatus(q.id, "pending")}
                              className="p-2 rounded-lg bg-ivory hover:bg-white border border-charcoal text-charcoal transition-all"
                              title="Restore question"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(q.id, "hidden")}
                              className="p-2 rounded-lg bg-ivory hover:bg-amber-100 border border-charcoal text-amber-900 transition-all"
                              title="Hide from projector"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteConfirmId(q.id)}
                            className="p-2 rounded-lg bg-ivory hover:bg-rose-100 border border-charcoal text-rose-800 transition-all"
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

          {/* RIGHT COLUMN: DOWNLOADABLE QR CODE */}
          <div>
            <QRCodeCard />
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="editorial-box max-w-md w-full p-6 rounded-3xl bg-white border-3 border-charcoal">
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-display text-3xl font-black text-charcoal">DELETE QUESTION?</h3>
              </div>
              <p className="text-xs font-mono text-charcoal/80 mb-6">
                Are you sure you want to permanently delete this question? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 font-mono text-xs font-bold uppercase">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl bg-ivory hover:bg-white border border-charcoal"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteQuestion(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-2 border-charcoal shadow-editorial-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESET SESSION MODAL */}
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="editorial-box max-w-md w-full p-6 rounded-3xl bg-white border-3 border-charcoal">
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-display text-3xl font-black text-charcoal">RESET SESSION?</h3>
              </div>
              <p className="text-xs font-mono text-charcoal/80 mb-6">
                This will clear all submitted questions and reset the projector spotlight.
                Make sure you have exported a CSV or JSON backup if you wish to retain previous records.
              </p>
              <div className="flex items-center justify-end gap-2 font-mono text-xs font-bold uppercase">
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-ivory hover:bg-white border border-charcoal"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetSession}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-2 border-charcoal shadow-editorial-sm"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

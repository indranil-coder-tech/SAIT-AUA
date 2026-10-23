"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Send, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Shield, HelpCircle } from "lucide-react";
import { SpatialBackground } from "@/components/spatial/SpatialBackground";
import { Header } from "@/components/navigation/Header";
import { SpatialCard } from "@/components/spatial/SpatialCard";

const MAX_CHARS = 500;

const SUGGESTED_TOPICS = [
  "🎯 SAIT & student activities",
  "📚 Academics and examinations",
  "💻 Internships & placements",
  "🏢 IT department & faculty",
  "🚀 Career advice & technical skills",
  "☕ College life & personal experiences",
  "🍕 Funny, random, & unusual questions",
];

export default function SubmitPage() {
  const [question, setQuestion] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const charCount = question.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isValid = question.trim().length > 0 && !isOverLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          honeypot,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Submission failed. Please check your connection and try again.");
      }

      // Success confirmed by backend
      setSubmittedSuccess(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.75 },
        colors: ["#8B5CF6", "#06B6D4", "#3B82F6", "#F59E0B"],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskAnother = () => {
    setQuestion("");
    setSubmittedSuccess(false);
    setErrorMessage(null);
  };

  const handleSuggestionClick = (topic: string) => {
    if (!question) {
      setQuestion(`Regarding ${topic.replace(/^[^\w\s]+/, "").trim()}: `);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-violet-600 selection:text-white">
      <SpatialBackground />
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-xl mx-auto w-full">
        {submittedSuccess ? (
          /* ================= SUCCESS STATE ================= */
          <SpatialCard glow="violet" className="w-full p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-spatial-glow">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Your question is in! 🎉
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
              Thanks for asking. Keep the curiosity coming — your question is queued for discussion by the SAIT team on the main screen!
            </p>

            <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 mb-6 text-left">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-violet-400 block mb-1">
                Submitted Question:
              </span>
              <p className="text-sm text-slate-200 italic break-words">&ldquo;{question}&rdquo;</p>
            </div>

            <button
              onClick={handleAskAnother}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-spatial-glow hover:opacity-95 transition-all active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ask Another Question</span>
            </button>
          </SpatialCard>
        ) : (
          /* ================= SUBMISSION FORM ================= */
          <div className="w-full flex flex-col gap-6">
            {/* Header / Hero Section */}
            <div className="text-center space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SAIT GIM • Ask Us Anything</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Your Questions. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-300 to-blue-400">
                  Our Honest Answers.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium">
                &ldquo;No question is too silly, and no doubt is too small!&rdquo;
              </p>

              {/* Privacy Guarantee Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>100% Anonymous. No login, names, or accounts required.</span>
              </div>
            </div>

            {/* Submission Form Card */}
            <SpatialCard glow="violet" className="w-full p-5 sm:p-7 shadow-spatial-card">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field (hidden from real users, traps spambots) */}
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                {/* Question Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="question-input" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
                      <span>What&apos;s on your mind?</span>
                    </label>

                    {/* Character Counter */}
                    <span
                      className={`text-xs font-mono transition-colors ${
                        isOverLimit
                          ? "text-rose-400 font-bold"
                          : charCount > 450
                          ? "text-amber-400 font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      {charCount} / {MAX_CHARS}
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      id="question-input"
                      rows={5}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask us anything about academics, college life, careers, SAIT, or literally anything…"
                      maxLength={MAX_CHARS + 50}
                      disabled={submitting}
                      className={`w-full rounded-xl bg-midnight-900/80 border p-4 text-slate-100 placeholder:text-slate-500 text-sm sm:text-base focus:outline-none transition-all resize-none ${
                        isOverLimit
                          ? "border-rose-500 ring-1 ring-rose-500"
                          : "border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                      }`}
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs sm:text-sm animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="flex-1">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm sm:text-base shadow-spatial-glow hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Anonymously...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Question</span>
                    </>
                  )}
                </button>
              </form>
            </SpatialCard>

            {/* Optional Topic Inspiration Chips */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
                Need ideas? Tap any topic to start:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleSuggestionClick(topic)}
                    className="text-xs px-3 py-1.5 rounded-full bg-midnight-900/60 hover:bg-violet-950/60 border border-white/5 hover:border-violet-500/30 text-slate-300 hover:text-white transition-all active:scale-95 text-left"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-white/5">
        Student Association of Information Technology (SAIT) • GIM Ask Us Anything
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Send, CheckCircle2, AlertCircle, RefreshCw, Shield, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { broadcastSyncEvent } from "@/lib/sync";

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

      setSubmittedSuccess(true);
      broadcastSyncEvent("QUESTION_SUBMITTED");

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.75 },
        colors: ["#FF814F", "#E8F05A", "#9EAE86", "#20231E"],
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskAnother = () => {
    setQuestion("");
    setSubmittedSuccess(false);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal selection:bg-citrus selection:text-charcoal">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-16 max-w-xl mx-auto w-full">
        {submittedSuccess ? (
          /* ================= SUCCESS STATE ================= */
          <div className="w-full bg-white rounded-3xl border-3 border-charcoal p-8 sm:p-10 shadow-editorial-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-20 h-20 rounded-full bg-citrus border-2 border-charcoal flex items-center justify-center text-charcoal shadow-editorial-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-olive bg-sage/20 px-3 py-1 rounded-full border border-charcoal/20">
                SUCCESS CONFIRMED
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-black text-charcoal leading-none">
                QUESTION RECEIVED.
              </h2>
              <p className="text-base text-charcoal/80 font-medium leading-relaxed max-w-sm mx-auto">
                You&apos;re officially part of the conversation! Your question has been queued live for the SAIT panel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory border-2 border-charcoal/20 text-left font-serif italic text-base text-charcoal">
              &ldquo;{question}&rdquo;
            </div>

            <button
              onClick={handleAskAnother}
              className="btn-editorial-citrus w-full py-4 px-6 rounded-2xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider shadow-editorial transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ask Another Question</span>
            </button>
          </div>
        ) : (
          /* ================= SUBMISSION FORM ================= */
          <div className="w-full flex flex-col gap-6">
            {/* Header Titles */}
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-charcoal/70 hover:text-charcoal mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Hub</span>
              </Link>

              <div className="inline-block px-3 py-1 rounded-full bg-sage/30 text-charcoal border border-charcoal font-mono text-[11px] font-bold uppercase tracking-wider">
                SAIT GIM · ANONYMOUS FORUM
              </div>

              <h1 className="font-display text-5xl sm:text-6xl font-black text-charcoal leading-none">
                GOT A QUESTION?
              </h1>

              <p className="text-lg font-bold text-olive-dark">
                Ask anything. No names. No awkwardness.
              </p>
            </div>

            {/* Form Box */}
            <div className="bg-white rounded-3xl border-3 border-charcoal p-6 sm:p-8 shadow-editorial-lg">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot field */}
                <div className="sr-only" aria-hidden="true">
                  <input
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-charcoal">
                    <label htmlFor="question-input" className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-tangerine" />
                      <span>Your Question</span>
                    </label>

                    <span
                      className={
                        isOverLimit
                          ? "text-rose-600 font-black"
                          : charCount > 450
                          ? "text-tangerine font-black"
                          : "text-charcoal/60"
                      }
                    >
                      {charCount} / {MAX_CHARS}
                    </span>
                  </div>

                  <textarea
                    id="question-input"
                    rows={5}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What's on your mind? Don't hold back..."
                    maxLength={MAX_CHARS + 50}
                    disabled={submitting}
                    className="w-full p-4 rounded-2xl bg-ivory-50 border-2 border-charcoal text-charcoal placeholder:text-charcoal/40 text-base font-medium focus:outline-none focus:ring-4 focus:ring-citrus/40 resize-none transition-all"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-100 border-2 border-rose-600 flex items-center gap-2 text-rose-900 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="btn-editorial-tangerine w-full py-4 px-6 rounded-2xl text-base uppercase tracking-wider shadow-editorial transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Submitting Anonymously...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Question Anonymously</span>
                    </>
                  )}
                </button>

                {/* Privacy Guarantee Pill */}
                <div className="text-center pt-2">
                  <span className="text-[11px] font-mono text-charcoal/70 inline-flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-olive" />
                    <span>100% Anonymous. No login, registration, or name required.</span>
                  </span>
                </div>
              </form>
            </div>

            {/* Inspiration Chips */}
            <div className="space-y-2">
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-charcoal/70 text-center">
                Need inspiration? Tap any topic to start:
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      if (!question) {
                        setQuestion(`Regarding ${topic.replace(/^[^\w\s]+/, "").trim()}: `);
                      }
                    }}
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-citrus border border-charcoal text-xs font-medium text-charcoal transition-colors active:scale-95 text-left"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs font-mono text-charcoal/60 border-t border-charcoal/15">
        Student Association of Information Technology (SAIT) · GIM Ask Us Anything
      </footer>
    </div>
  );
}

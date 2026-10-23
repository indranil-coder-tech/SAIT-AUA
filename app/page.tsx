"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDown,
  Sparkles,
  Shield,
  Send,
  Tv,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Header } from "@/components/navigation/Header";
import { Sculptural3DQuestion } from "@/components/spatial/Sculptural3DQuestion";
import { Question } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const EDITORIAL_TOPICS = [
  "🎯 SAIT Activities & Hackathons",
  "📚 Balancing Academics & CGPA",
  "💼 Internships, Placements & Tech Stacks",
  "🏢 Faculty & Department Lore",
  "☕ College Life & Hostel Truths",
  "🍕 Random, Unhinged & Fun Doubts",
];

export default function HomePage() {
  const [liveQuestions, setLiveQuestions] = useState<Question[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load live questions queue from API
  const loadQuestions = useCallback(async () => {
    try {
      const res = await fetch("/api/questions?includeHidden=false", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setLiveQuestions(json.data.questions || []);
      }
    } catch {
      // ignore network errors on polling
    }
  }, []);

  useEffect(() => {
    loadQuestions();
    const interval = setInterval(loadQuestions, 4000);
    return () => clearInterval(interval);
  }, [loadQuestions]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("home_live_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, () => {
        loadQuestions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadQuestions]);

  // Submission handler
  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = questionText.trim();
    if (!trimmed || trimmed.length > 500 || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, honeypot }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Submission failed. Please try again.");
      }

      setSubmittedSuccess(true);
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.75 },
        colors: ["#FF814F", "#E8F05A", "#9EAE86", "#20231E"],
      });
      loadQuestions();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error submitting question.");
    } finally {
      setSubmitting(false);
    }
  };

  const exampleEditorialCards = [
    {
      id: "ex-1",
      num: "01",
      topic: "COLLEGE LIFE",
      text: "How do you realistically balance academic coursework, assignments, and active club projects?",
    },
    {
      id: "ex-2",
      num: "02",
      topic: "CAREER & SKILLS",
      text: "What programming languages or technical skills actually mattered when applying for internships?",
    },
    {
      id: "ex-3",
      num: "03",
      topic: "SAIT MEMBERSHIP",
      text: "How can first-year students join the SAIT tech core committee, and what do juniors work on?",
    },
    {
      id: "ex-4",
      num: "04",
      topic: "FIRST-YEAR ADVICE",
      text: "What is the single biggest mistake first-year IT juniors make, and what do you wish you knew?",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal selection:bg-citrus selection:text-charcoal">
      <Header />

      {/* =========================================================================
          SECTION 1: HERO — ASYMMETRICAL EDITORIAL 3D SHOWCASE (WARM IVORY CANVAS)
         ========================================================================= */}
      <section className="relative w-full border-b-2 border-charcoal bg-ivory overflow-hidden pt-6 pb-16 sm:py-20 lg:py-24">
        {/* Editorial Grid Texture */}
        <div className="absolute inset-0 bg-editorial-grid opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Top Editorial Ticker / Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-charcoal/20 text-xs font-mono font-bold tracking-widest uppercase text-charcoal/80">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-tangerine animate-pulse" />
              <span>SAIT PRESENTS · GIM SESSION</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline">LIVE QUESTION FORUM</span>
              <span>EST. 2025</span>
              <span>VOL. 01</span>
            </div>
          </div>

          {/* Asymmetric Hero Grid: Giant Typography on Left, 3D Sculpture on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left 7 Columns: Giant Editorial Typography & CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              {/* Massive Bold Display Headline */}
              <div className="space-y-0">
                <h1 className="font-display text-7xl sm:text-8xl md:text-9xl lg:text-[132px] font-black tracking-tight text-charcoal leading-[0.88] select-none">
                  ASK <br />
                  US <br />
                  ANYTHING.
                </h1>
              </div>

              {/* Editorial Paragraphs */}
              <div className="space-y-3 max-w-xl">
                <p className="text-xl sm:text-2xl font-bold text-olive-dark tracking-tight leading-snug">
                  Your questions. Our honest answers.
                </p>
                <p className="text-base sm:text-lg text-charcoal/80 font-medium leading-relaxed">
                  &ldquo;No question is too silly, and no doubt is too small!&rdquo; Step right up, first-years. Speak your mind freely with 100% anonymity.
                </p>
              </div>

              {/* Action Buttons & Quick Links */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/submit"
                  className="btn-editorial-tangerine inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base sm:text-lg uppercase tracking-wider shadow-editorial transition-all"
                >
                  <span>Ask Anonymously</span>
                  <ArrowUpRight className="w-5 h-5" />
                </Link>

                <a
                  href="#live-questions"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white border-2 border-charcoal font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal hover:bg-citrus/40 hover:shadow-editorial-sm transition-all"
                >
                  <span>Explore Live Questions</span>
                  <ArrowDown className="w-4 h-4" />
                </a>
              </div>

              {/* Tiny Guarantee Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-charcoal/70">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-charcoal/30">
                  <Shield className="w-3.5 h-3.5 text-olive" />
                  <span>Zero tracking · No names stored</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-charcoal/30">
                  <Sparkles className="w-3.5 h-3.5 text-tangerine" />
                  <span>Classroom Projector Synchronized</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Dominant 3D Physical Question Sculpture */}
            <div className="lg:col-span-5 flex items-center justify-center pt-4 lg:pt-0">
              <Sculptural3DQuestion />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: LIVE QUESTION EXPERIENCE (FRESH SAGE GREEN CANVAS)
         ========================================================================= */}
      <section
        id="live-questions"
        className="w-full bg-sage border-b-2 border-charcoal py-16 sm:py-24 text-charcoal relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 mb-12 border-b-2 border-charcoal">
            <div className="space-y-2 max-w-2xl">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-charcoal/80 bg-white/60 px-3 py-1 rounded-full border border-charcoal">
                LIVE ACTIVITY FEED
              </span>
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-charcoal leading-none">
                WHAT&apos;S ON YOUR MIND?
              </h2>
              <p className="text-lg sm:text-xl font-bold text-olive-dark">
                Every question deserves a place. Realtime questions from first-years:
              </p>
            </div>

            {/* Live Count Pill */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-charcoal shadow-editorial-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold uppercase text-charcoal/70">
                  TOTAL RECEIVED
                </span>
                <span className="font-display text-3xl font-black text-charcoal leading-none">
                  {liveQuestions.length}
                </span>
              </div>
              <div className="w-px h-8 bg-charcoal/20" />
              <Link
                href="/display"
                className="btn-editorial-citrus px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Open Projector</span>
              </Link>
            </div>
          </div>

          {/* Question Grid: Asymmetrical Cards Composition */}
          {liveQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="editorial-box rounded-2xl p-6 flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-charcoal/15">
                    <span className="font-mono text-xs font-black bg-citrus px-2.5 py-0.5 rounded-full border border-charcoal">
                      NO. {idx < 9 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-charcoal/5 border border-charcoal/20">
                      {q.status}
                    </span>
                  </div>

                  <blockquote className="text-lg sm:text-xl font-bold text-charcoal leading-snug break-words">
                    &ldquo;{q.question}&rdquo;
                  </blockquote>

                  <div className="pt-3 border-t border-charcoal/10 flex items-center justify-between text-[11px] font-mono text-charcoal/60">
                    <span>ANONYMOUS SUBMISSION</span>
                    <span>QUEUE #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Example Genuine Editorial Questions Preview */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {exampleEditorialCards.map((item) => (
                <div
                  key={item.id}
                  className="editorial-box rounded-2xl p-6 flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-charcoal/15">
                    <span className="font-mono text-xs font-black bg-citrus px-2.5 py-0.5 rounded-full border border-charcoal">
                      NO. {item.num}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-charcoal/5 border border-charcoal/20">
                      {item.topic}
                    </span>
                  </div>

                  <blockquote className="text-base sm:text-lg font-bold text-charcoal leading-snug">
                    &ldquo;{item.text}&rdquo;
                  </blockquote>

                  <div className="pt-3 border-t border-charcoal/10 flex items-center justify-between text-[11px] font-mono text-charcoal/60">
                    <span>EXAMPLE DOUBT</span>
                    <span>READY TO DISCUSS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ANONYMOUS QUESTION SUBMISSION (DEEP OLIVE / WARM CANVAS)
         ========================================================================= */}
      <section className="w-full bg-olive-deep text-ivory py-16 sm:py-24 border-b-2 border-charcoal relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center space-y-3 mb-10">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-citrus bg-olive-dark px-3 py-1 rounded-full border border-citrus/40">
              ZERO AWKWARDNESS · 100% PRIVATE
            </span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-ivory leading-none">
              GOT A QUESTION?
            </h2>
            <p className="text-lg sm:text-xl font-bold text-sage-light">
              Ask anything. No names. No awkwardness.
            </p>
          </div>

          {/* Submission Form Box */}
          <div className="bg-ivory text-charcoal rounded-3xl border-3 border-charcoal p-6 sm:p-10 shadow-editorial-xl max-w-2xl mx-auto">
            {submittedSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-citrus border-2 border-charcoal flex items-center justify-center mx-auto shadow-editorial-sm">
                  <CheckCircle2 className="w-8 h-8 text-charcoal" />
                </div>
                <h3 className="font-display text-4xl font-black text-charcoal">
                  QUESTION RECEIVED.
                </h3>
                <p className="text-base font-medium text-charcoal/80 max-w-md mx-auto">
                  You&apos;re officially part of the conversation! Your question has been queued for the senior SAIT panel to answer live.
                </p>

                <div className="p-4 rounded-xl bg-sage/20 border border-charcoal/20 text-left font-serif italic text-sm text-charcoal my-4">
                  &ldquo;{questionText}&rdquo;
                </div>

                <button
                  onClick={() => {
                    setSubmittedSuccess(false);
                    setQuestionText("");
                  }}
                  className="btn-editorial-citrus px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Ask Another Question</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleInlineSubmit} className="space-y-5">
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
                    <label htmlFor="home-question-input" className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-tangerine" />
                      <span>Your Question</span>
                    </label>
                    <span
                      className={
                        questionText.length > 500
                          ? "text-rose-600 font-black"
                          : questionText.length > 450
                          ? "text-tangerine font-black"
                          : "text-charcoal/60"
                      }
                    >
                      {questionText.length} / 500
                    </span>
                  </div>

                  <textarea
                    id="home-question-input"
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="What's on your mind? Don't hold back..."
                    maxLength={550}
                    disabled={submitting}
                    className="w-full p-4 rounded-2xl bg-white border-2 border-charcoal text-charcoal placeholder:text-charcoal/40 text-base font-medium focus:outline-none focus:ring-4 focus:ring-citrus/40 resize-none transition-all shadow-inner"
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
                  disabled={!questionText.trim() || questionText.length > 500 || submitting}
                  className="btn-editorial-tangerine w-full py-4 px-6 rounded-2xl text-base sm:text-lg uppercase tracking-wider shadow-editorial transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Sending Anonymously...</span>
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
                  <span className="text-[11px] font-mono text-charcoal/60 font-medium">
                    🔒 Absolutely no names, email addresses, or phone identifiers are recorded.
                  </span>
                </div>
              </form>
            )}

            {/* Suggested Topic Chips */}
            <div className="mt-8 pt-6 border-t border-charcoal/15">
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-charcoal/60 text-center mb-3">
                Need inspiration? Tap any topic:
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {EDITORIAL_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      if (!questionText) {
                        setQuestionText(`Regarding ${topic.replace(/^[^\w\s]+/, "").trim()}: `);
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
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: PORTAL LAUNCHERS (THREE DISTINCT COLOR BLOCKS)
         ========================================================================= */}
      <section className="w-full bg-ivory py-16 sm:py-20 border-b-2 border-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student View */}
            <Link
              href="/submit"
              className="editorial-box rounded-3xl p-8 bg-citrus/20 hover:bg-citrus/30 flex flex-col justify-between group transition-all"
            >
              <div>
                <span className="font-mono text-xs font-black uppercase tracking-widest text-charcoal bg-white px-3 py-1 rounded-full border border-charcoal">
                  01 · STUDENTS
                </span>
                <h3 className="font-display text-4xl font-black text-charcoal mt-6 mb-2">
                  SUBMIT QUESTION
                </h3>
                <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
                  Open on your phone. Dedicated mobile-first form designed for instant anonymous participation during GIM.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal group-hover:translate-x-1 transition-transform">
                <span>Launch Form</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Projector View */}
            <Link
              href="/display"
              className="editorial-box rounded-3xl p-8 bg-sage/20 hover:bg-sage/30 flex flex-col justify-between group transition-all"
            >
              <div>
                <span className="font-mono text-xs font-black uppercase tracking-widest text-charcoal bg-white px-3 py-1 rounded-full border border-charcoal">
                  02 · AUDITORIUM
                </span>
                <h3 className="font-display text-4xl font-black text-charcoal mt-6 mb-2">
                  LIVE PROJECTOR
                </h3>
                <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
                  High-contrast presentation stage for classroom walls. Readable from the back row with live realtime updates.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal group-hover:translate-x-1 transition-transform">
                <span>Open Projector</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Admin View */}
            <Link
              href="/admin"
              className="editorial-box rounded-3xl p-8 bg-tangerine/20 hover:bg-tangerine/30 flex flex-col justify-between group transition-all"
            >
              <div>
                <span className="font-mono text-xs font-black uppercase tracking-widest text-charcoal bg-white px-3 py-1 rounded-full border border-charcoal">
                  03 · ORGANIZERS
                </span>
                <h3 className="font-display text-4xl font-black text-charcoal mt-6 mb-2">
                  CONTROL PANEL
                </h3>
                <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
                  Protected with secure PIN login. Advance the questions, moderate queue, and download QR codes.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal group-hover:translate-x-1 transition-transform">
                <span>Admin Login</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="w-full bg-charcoal text-ivory py-10 px-4 sm:px-6 border-t-2 border-charcoal">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl tracking-wider text-citrus">SAIT</span>
            <span>· STUDENT ASSOCIATION OF INFORMATION TECHNOLOGY</span>
          </div>
          <span className="text-ivory/60">GIM Ask Us Anything · All Submissions Anonymized</span>
        </div>
      </footer>
    </div>
  );
}

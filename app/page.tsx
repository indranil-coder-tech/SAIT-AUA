"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Tv,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Shield,
  Layers,
  Zap,
} from "lucide-react";
import { SpatialBackground } from "@/components/spatial/SpatialBackground";
import { Header } from "@/components/navigation/Header";
import { SpatialCard } from "@/components/spatial/SpatialCard";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-midnight-950 text-white selection:bg-violet-600 selection:text-white">
      <SpatialBackground />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center justify-center space-y-12 sm:space-y-16">
        {/* HERO TITLE & SPATIAL INTRO */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-spatial-glow">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Student Association of Information Technology (SAIT)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Ask Us Anything. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-300 to-blue-400 text-glow-cyan">
              Live Spatial Experience.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome first-year juniors! Submit your genuine questions anonymously from your phone, watch them stream live on the classroom projector, and hear honest answers from senior SAIT board members.
          </p>
        </div>

        {/* THREE CORE PORTALS (SPATIAL 3D CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* 1. Student Submission Portal */}
          <Link href="/submit" className="group block focus:outline-none">
            <SpatialCard
              glow="violet"
              className="h-full p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.02] border border-violet-500/30"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300 mb-6 group-hover:bg-violet-600/40 transition-colors">
                  <Send className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
                    Student Mobile Portal
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Submit Question
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Open on your mobile phone via QR code or link. 100% anonymous, zero login or registration required.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-violet-300 group-hover:text-cyan-300 transition-colors">
                <span>Launch Submission Form</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </SpatialCard>
          </Link>

          {/* 2. Classroom Projector Display */}
          <Link href="/display" className="group block focus:outline-none">
            <SpatialCard
              glow="cyan"
              className="h-full p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.02] border border-cyan-500/30"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-6 group-hover:bg-cyan-600/40 transition-colors">
                  <Tv className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    Classroom Presentation
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Live Projector Display
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  High-contrast 16:9 projector layout. Visible from the back of the auditorium with realtime sync and fullscreen mode.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-cyan-300 group-hover:text-white transition-colors">
                <span>Open Projector View</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </SpatialCard>
          </Link>

          {/* 3. Protected Organizer Panel */}
          <Link href="/admin" className="group block focus:outline-none">
            <SpatialCard
              glow="none"
              className="h-full p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.02] border border-white/10 hover:border-indigo-500/40"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 mb-6 group-hover:bg-indigo-600/40 transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                    SAIT Board Controls
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Organizer Dashboard
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Protected by secure PIN authentication. Step through questions, manage queue status, and download QR codes.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-300 group-hover:text-white transition-colors">
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </SpatialCard>
          </Link>
        </div>

        {/* KEY HIGHLIGHTS / PRIVACY BADGES */}
        <div className="w-full max-w-4xl p-6 sm:p-8 rounded-2xl bg-midnight-900/60 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Absolute Privacy</h4>
            <p className="text-xs text-slate-400">
              No IP addresses, names, or tracking identifiers stored or logged. Complete anonymity for students.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Supabase Realtime</h4>
            <p className="text-xs text-slate-400">
              Live updates without page refresh. Projector immediately synchronizes with organizer navigation.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Offline Resilience</h4>
            <p className="text-xs text-slate-400">
              Last-synced cache ensures uninterrupted projector presentation even if campus WiFi momentarily fluctuates.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-white/10 text-center text-xs text-slate-500">
        Student Association of Information Technology (SAIT) • College GIM Session
      </footer>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Tv, ShieldCheck, Send, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  status?: "connected" | "reconnecting" | "offline";
  compact?: boolean;
}

export function Header({ status = "connected", compact = false }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-midnight-950/70 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-spatial-glow border border-white/20 transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-white animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-300 text-lg">
                SAIT
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                GIM 2025
              </span>
            </div>
            {!compact && (
              <p className="text-xs text-slate-400 font-medium">Ask Us Anything • Live Spatial Q&A</p>
            )}
          </div>
        </Link>

        {/* Navigation Routes */}
        <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
          <Link
            href="/submit"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
              pathname === "/submit"
                ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </Link>

          <Link
            href="/display"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
              pathname === "/display"
                ? "bg-cyan-600/30 text-cyan-200 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Projector</span>
          </Link>

          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
              pathname === "/admin"
                ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          {/* Connection Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-white/10">
            <Radio
              className={cn(
                "w-3.5 h-3.5",
                status === "connected" && "text-emerald-400 animate-pulse",
                status === "reconnecting" && "text-amber-400 animate-spin",
                status === "offline" && "text-rose-400"
              )}
            />
            <span
              className={cn(
                "text-xs font-mono",
                status === "connected" && "text-emerald-400",
                status === "reconnecting" && "text-amber-400",
                status === "offline" && "text-rose-400"
              )}
            >
              {status === "connected" ? "SYNCED" : status === "reconnecting" ? "RECONNECTING" : "OFFLINE"}
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}

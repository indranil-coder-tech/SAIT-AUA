"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Tv, ShieldCheck, Send, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  status?: "connected" | "reconnecting" | "offline";
  compact?: boolean;
}

export function Header({ status = "connected", compact = false }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-ivory/95 backdrop-blur-md border-b-2 border-charcoal transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Left */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center px-2.5 py-1 bg-charcoal text-citrus font-display text-xl tracking-wider border-2 border-charcoal shadow-editorial-sm transition-transform group-hover:-translate-y-0.5">
            SAIT
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display tracking-wide text-charcoal text-lg sm:text-xl leading-none">
                ASK US ANYTHING
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-sage/30 text-olive-dark border border-charcoal">
                GIM &apos;26
              </span>
            </div>
            {!compact && (
              <span className="text-[10px] font-mono text-charcoal/70 tracking-wider">
                STUDENT ASSOCIATION OF IT
              </span>
            )}
          </div>
        </Link>

        {/* Navigation Routes Right */}
        <nav className="flex items-center gap-2 sm:gap-3 text-xs font-mono font-bold uppercase tracking-wider">
          <Link
            href="/submit"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-charcoal transition-all active:translate-x-[1px] active:translate-y-[1px]",
              pathname === "/submit"
                ? "bg-tangerine text-charcoal shadow-editorial-sm font-extrabold"
                : "bg-white text-charcoal hover:bg-tangerine/30 hover:shadow-editorial-sm"
            )}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
            <ArrowUpRight className="w-3 h-3 opacity-70" />
          </Link>

          <Link
            href="/display"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-charcoal transition-all active:translate-x-[1px] active:translate-y-[1px]",
              pathname === "/display"
                ? "bg-citrus text-charcoal shadow-editorial-sm font-extrabold"
                : "bg-white text-charcoal hover:bg-citrus/30 hover:shadow-editorial-sm"
            )}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Projector</span>
          </Link>

          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-charcoal transition-all active:translate-x-[1px] active:translate-y-[1px]",
              pathname === "/admin"
                ? "bg-sage text-charcoal shadow-editorial-sm font-extrabold"
                : "bg-white text-charcoal hover:bg-sage/30 hover:shadow-editorial-sm"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* Connection Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l-2 border-charcoal/20">
            <Radio
              className={cn(
                "w-3.5 h-3.5",
                status === "connected" && "text-emerald-700 animate-pulse",
                status === "reconnecting" && "text-amber-700 animate-spin",
                status === "offline" && "text-rose-700"
              )}
            />
            <span className="text-[10px] font-mono font-bold tracking-widest text-charcoal/80">
              {status === "connected" ? "LIVE SYNC" : status === "reconnecting" ? "RECONNECTING" : "OFFLINE"}
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}

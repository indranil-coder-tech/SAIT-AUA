"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Question } from "@/lib/types";

interface EditorialQuestionCardProps {
  question: Question;
  sequenceNumber?: number;
  isCurrent?: boolean;
  className?: string;
  theme?: "ivory" | "sage" | "citrus" | "olive";
  actions?: React.ReactNode;
}

export function EditorialQuestionCard({
  question,
  sequenceNumber,
  isCurrent = false,
  className,
  theme = "ivory",
  actions,
}: EditorialQuestionCardProps) {
  const seq = sequenceNumber || question.sequence_number || 1;
  const formattedNum = seq < 10 ? `0${seq}` : `${seq}`;

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-charcoal p-5 sm:p-6 transition-all duration-200",
        isCurrent
          ? "bg-citrus shadow-editorial-lg scale-[1.01] -translate-y-1"
          : theme === "sage"
          ? "bg-sage/20 hover:bg-sage/30 shadow-editorial"
          : theme === "citrus"
          ? "bg-citrus/30 hover:bg-citrus/40 shadow-editorial"
          : theme === "olive"
          ? "bg-olive/15 hover:bg-olive/25 shadow-editorial"
          : "bg-white hover:bg-ivory-50 shadow-editorial",
        className
      )}
    >
      {/* Top Editorial Row */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-charcoal/15">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black tracking-wider text-charcoal bg-charcoal/10 px-2.5 py-0.5 rounded-full border border-charcoal/20">
            Q. {formattedNum}
          </span>
          {isCurrent && (
            <span className="px-2.5 py-0.5 rounded-full bg-charcoal text-citrus font-mono text-[10px] font-bold tracking-widest uppercase">
              LIVE ON SCREEN
            </span>
          )}
        </div>

        <span
          className={cn(
            "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-charcoal/30",
            question.status === "answered"
              ? "bg-emerald-100 text-emerald-900"
              : question.status === "hidden"
              ? "bg-rose-100 text-rose-900"
              : "bg-charcoal/5 text-charcoal"
          )}
        >
          {question.status}
        </span>
      </div>

      {/* Main Question Text */}
      <blockquote className="text-base sm:text-lg font-semibold text-charcoal leading-snug break-words">
        &ldquo;{question.question}&rdquo;
      </blockquote>

      {/* Bottom Row / Actions */}
      {actions && (
        <div className="mt-4 pt-3 border-t border-charcoal/15 flex items-center justify-end gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

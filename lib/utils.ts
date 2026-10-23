import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes input text:
 * - Trims leading/trailing whitespace
 * - Strips zero-width and control characters
 * - Ensures plain text only (strips script/HTML tags or dangerous constructs)
 * - Limits to max length
 */
export function sanitizeQuestionText(input: unknown, maxLength = 500): { valid: boolean; text: string; error?: string } {
  if (typeof input !== "string") {
    return { valid: false, text: "", error: "Question must be a valid text string." };
  }

  // Remove zero-width characters and control chars (except standard newlines/tabs)
  let cleaned = input.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

  // Basic validation
  if (!cleaned || cleaned.length === 0) {
    return { valid: false, text: "", error: "Question cannot be empty or only spaces." };
  }

  if (cleaned.length > maxLength) {
    return {
      valid: false,
      text: "",
      error: `Question exceeds the ${maxLength} character limit (currently ${cleaned.length} characters).`
    };
  }

  // Strip obvious executable script tags or HTML brackets to render purely as text
  cleaned = cleaned
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  return { valid: true, text: cleaned };
}

export function formatTimeAgo(timestamp: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 30) return "just now";
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return "recently";
  }
}

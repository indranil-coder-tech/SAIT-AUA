"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Question, SessionState } from "./types";
import { getSupabaseBrowserClient } from "./supabase/client";

const SYNC_CHANNEL_NAME = "sait_sync_channel";

/**
 * Broadcasts an update notification across all browser tabs and windows
 * running on the same origin (e.g., when a student submits or an admin updates a question).
 */
export function broadcastSyncEvent(eventType: string = "MUTATION") {
  if (typeof window === "undefined") return;

  // 1. Broadcast to other tabs/windows
  if ("BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
      bc.postMessage({ type: eventType, timestamp: Date.now() });
      bc.close();
    } catch {
      // Ignore broadcast errors
    }
  }

  // 2. Dispatch local event for the active window
  window.dispatchEvent(new CustomEvent("sait_sync_event", { detail: { type: eventType } }));
}

interface UseQuestionSyncOptions {
  includeHidden?: boolean;
  enabled?: boolean;
  pollingIntervalMs?: number; // Used when visible & Realtime is NOT active (default: 7000ms)
  heartbeatIntervalMs?: number; // Used when visible & Realtime IS active (default: 45000ms)
  cacheKeyPrefix?: string; // Optional local storage cache prefix (e.g. for display page)
  onDataLoaded?: (data: { questions: Question[]; session: SessionState | null }) => void;
}

export function useQuestionSync({
  includeHidden = false,
  enabled = true,
  pollingIntervalMs = 7000,
  heartbeatIntervalMs = 45000,
  cacheKeyPrefix,
  onDataLoaded,
}: UseQuestionSyncOptions = {}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "reconnecting" | "offline">("connected");
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Refs to avoid race conditions, overlapping fetches, and memory leaks
  const inFlightRef = useRef(false);
  const isMountedRef = useRef(true);
  const isRealtimeActiveRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize from localStorage cache if prefix is provided
  useEffect(() => {
    if (!cacheKeyPrefix || typeof window === "undefined") return;
    try {
      const cachedQ = localStorage.getItem(`${cacheKeyPrefix}_questions`);
      const cachedS = localStorage.getItem(`${cacheKeyPrefix}_session`);
      if (cachedQ) setQuestions(JSON.parse(cachedQ));
      if (cachedS) setSession(JSON.parse(cachedS));
    } catch {
      // Ignore storage read errors
    }
  }, [cacheKeyPrefix]);

  const clearTimer = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  // Fetch latest data from the server
  const loadData = useCallback(
    async (isManual: boolean = false): Promise<void> => {
      if (!isMountedRef.current || !enabled) return;

      // Prevent overlapping requests
      if (inFlightRef.current) return;

      // Debounce rapid calls (e.g., React Strict Mode double-invocation on mount)
      const now = Date.now();
      if (!isManual && now - lastFetchTimeRef.current < 1200) {
        return;
      }

      // If document is hidden and this is not a manual/reconnect refresh, skip
      if (!isManual && typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      inFlightRef.current = true;
      setLoading(true);

      // Cancel any previous in-flight fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const url = `/api/questions?includeHidden=${includeHidden}`;
        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const json = await res.json();
        if (json.success && json.data && isMountedRef.current) {
          const fetchedQuestions: Question[] = json.data.questions || [];
          const fetchedSession: SessionState | null = json.data.session || null;

          setQuestions(fetchedQuestions);
          setSession(fetchedSession);
          setConnectionStatus("connected");
          setLastSyncTime(new Date().toLocaleTimeString());
          lastFetchTimeRef.current = Date.now();

          onDataLoaded?.({ questions: fetchedQuestions, session: fetchedSession });

          // Cache in localStorage if configured
          if (cacheKeyPrefix && typeof window !== "undefined") {
            try {
              localStorage.setItem(`${cacheKeyPrefix}_questions`, JSON.stringify(fetchedQuestions));
              localStorage.setItem(`${cacheKeyPrefix}_session`, JSON.stringify(fetchedSession));
            } catch {
              // Ignore storage write errors
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Ignore intentional abort
        }
        if (isMountedRef.current) {
          setConnectionStatus("reconnecting");
        }
      } finally {
        inFlightRef.current = false;
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [enabled, includeHidden, cacheKeyPrefix, onDataLoaded]
  );

  // Intelligent recursive polling scheduler
  const scheduleNextPoll = useCallback(() => {
    clearTimer();
    if (!isMountedRef.current || !enabled) return;

    // Use slow heartbeat if Supabase Realtime is healthy; otherwise use fallback polling interval
    const interval = isRealtimeActiveRef.current ? heartbeatIntervalMs : pollingIntervalMs;

    timeoutIdRef.current = setTimeout(async () => {
      // Only execute poll if window is visible
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        await loadData();
      }
      scheduleNextPoll();
    }, interval);
  }, [clearTimer, enabled, heartbeatIntervalMs, pollingIntervalMs, loadData]);

  // Initial load & polling lifecycle
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      loadData();
      scheduleNextPoll();
    }

    return () => {
      clearTimer();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, loadData, scheduleNextPoll, clearTimer]);

  // Tab visibility change: pause when hidden, immediately refresh & resume when visible
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
        scheduleNextPoll();
      } else {
        clearTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, loadData, scheduleNextPoll, clearTimer]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!enabled) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channelName = `realtime_${includeHidden ? "admin" : "public"}_${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, () => {
        loadData(true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "session_state" }, () => {
        loadData(true);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          isRealtimeActiveRef.current = true;
          setConnectionStatus("connected");
          scheduleNextPoll(); // Update poll interval to heartbeat
        } else if (status === "CLOSED" || status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
          isRealtimeActiveRef.current = false;
          setConnectionStatus("reconnecting");
          scheduleNextPoll(); // Revert to frequent polling fallback
        }
      });

    return () => {
      isRealtimeActiveRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [enabled, includeHidden, loadData, scheduleNextPoll]);

  // Cross-tab synchronization via BroadcastChannel & CustomEvent
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
        bc.onmessage = () => {
          loadData(true);
        };
      } catch {
        // BroadcastChannel unavailable
      }
    }

    const handleLocalSync = () => {
      loadData(true);
    };

    window.addEventListener("sait_sync_event", handleLocalSync);

    return () => {
      window.removeEventListener("sait_sync_event", handleLocalSync);
      if (bc) {
        try {
          bc.close();
        } catch {
          // ignore
        }
      }
    };
  }, [enabled, loadData]);

  const refresh = useCallback(() => loadData(true), [loadData]);

  return {
    questions,
    session,
    loading,
    connectionStatus,
    lastSyncTime,
    refresh,
    setQuestions,
    setSession,
  };
}

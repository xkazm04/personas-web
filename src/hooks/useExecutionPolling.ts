"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import { DEVELOPMENT } from "@/lib/dev";
import { useAuthStore } from "@/stores/authStore";
import type { PersonaExecutionStatus } from "@/lib/types";

interface ExecutionPollState {
  output: string[];
  status: PersonaExecutionStatus;
  durationMs?: number;
  totalCostUsd?: number;
}

interface ExecutionStreamMessage {
  output?: string[];
  status?: PersonaExecutionStatus;
  durationMs?: number;
  totalCostUsd?: number;
}

const TERMINAL_STATUSES = new Set<PersonaExecutionStatus>([
  "completed",
  "failed",
  "cancelled",
]);
const MAX_OUTPUT_LINES = 500;

/**
 * Streams a running execution's output from the orchestrator's SSE endpoint.
 * Falls back to interval polling when EventSource is unavailable, when running
 * in dev/demo mode, or when the SSE connection fails. Stops automatically once
 * a terminal status is reached.
 */
export function useExecutionPolling(
  executionId: string | null,
  intervalMs = 1000,
) {
  const [state, setState] = useState<ExecutionPollState>({
    output: [],
    status: "queued",
  });
  const offsetRef = useRef(0);
  const [stopped, setStopped] = useState(false);
  const [sseActive, setSseActive] = useState(false);
  const isDemo = useAuthStore((s) => s.isDemo);

  const canUseSse =
    !DEVELOPMENT &&
    !isDemo &&
    typeof window !== "undefined" &&
    typeof window.EventSource !== "undefined";

  // Reset when executionId changes
  useEffect(() => {
    setState({ output: [], status: "queued" });
    offsetRef.current = 0;
    setStopped(false);
    setSseActive(false);
  }, [executionId]);

  const stop = useCallback(() => {
    setStopped(true);
  }, []);

  const poll = useCallback(async () => {
    if (!executionId) return;
    const data = await api.getExecution(executionId, offsetRef.current);
    setState((prev) => ({
      output: [...prev.output, ...data.output].slice(-MAX_OUTPUT_LINES),
      status: data.status,
      durationMs: data.durationMs,
      totalCostUsd: data.totalCostUsd,
    }));
    offsetRef.current += data.output.length;
    if (TERMINAL_STATUSES.has(data.status)) {
      setStopped(true);
    }
  }, [executionId]);

  // Polling runs only when SSE isn't carrying the stream.
  usePolling(poll, intervalMs, !!executionId && !stopped && !sseActive);

  // SSE: try first; fall back to polling if it fails or disconnects.
  useEffect(() => {
    if (!executionId || stopped || !canUseSse) return;

    let disposed = false;
    const es = new EventSource(
      `/api/executions/${encodeURIComponent(executionId)}/stream`,
    );

    const applyMessage = (raw: string) => {
      let msg: ExecutionStreamMessage;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
      if (msg.output && msg.output.length > 0) {
        offsetRef.current += msg.output.length;
      }
      setState((prev) => ({
        output:
          msg.output && msg.output.length > 0
            ? [...prev.output, ...msg.output].slice(-MAX_OUTPUT_LINES)
            : prev.output,
        status: msg.status ?? prev.status,
        durationMs: msg.durationMs ?? prev.durationMs,
        totalCostUsd: msg.totalCostUsd ?? prev.totalCostUsd,
      }));
      if (msg.status && TERMINAL_STATUSES.has(msg.status)) {
        setStopped(true);
        es.close();
      }
    };

    const onMessage = (e: MessageEvent) => applyMessage(e.data);
    es.addEventListener("message", onMessage);
    // Some servers tag execution updates explicitly.
    es.addEventListener("execution", onMessage as EventListener);

    es.onopen = () => {
      if (disposed) return;
      setSseActive(true);
    };

    es.onerror = () => {
      // Connection lost — close and let usePolling take over.
      es.close();
      if (disposed) return;
      setSseActive(false);
    };

    return () => {
      disposed = true;
      es.close();
    };
  }, [executionId, stopped, canUseSse]);

  return { ...state, stop };
}

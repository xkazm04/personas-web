import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api";

interface ExecutionPollState {
  output: string[];
  status: string;
  durationMs?: number;
  totalCostUsd?: number;
}

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

/**
 * Polls a running execution's output every `intervalMs` (default 1000ms).
 * Stops automatically once a terminal status is reached.
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (!executionId) return;
    try {
      const data = await api.getExecution(executionId, offsetRef.current);
      setState((prev) => {
        const merged = [...prev.output, ...data.output];
        return {
          output: merged,
          status: data.status,
          durationMs: data.durationMs,
          totalCostUsd: data.totalCostUsd,
        };
      });
      offsetRef.current += data.output.length;
      if (TERMINAL_STATUSES.has(data.status)) {
        stop();
      }
    } catch {
      // Keep polling on transient errors
    }
  }, [executionId, stop]);

  useEffect(() => {
    if (!executionId) return;
    // Reset
    setState({ output: [], status: "queued" });
    offsetRef.current = 0;

    void poll();
    timerRef.current = setInterval(poll, intervalMs);

    return stop;
  }, [executionId, intervalMs, poll, stop]);

  return { ...state, stop };
}

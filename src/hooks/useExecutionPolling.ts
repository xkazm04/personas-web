import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import type { PersonaExecutionStatus } from "@/lib/types";

interface ExecutionPollState {
  output: string[];
  status: PersonaExecutionStatus;
  durationMs?: number;
  totalCostUsd?: number;
}

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);
const MAX_OUTPUT_LINES = 500;

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
  const [stopped, setStopped] = useState(false);

  // Reset when executionId changes
  useEffect(() => {
    queueMicrotask(() => {
      setState({ output: [], status: "queued" });
      setStopped(false);
    });
    offsetRef.current = 0;
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

  usePolling(poll, intervalMs, !!executionId && !stopped);

  return { ...state, stop };
}

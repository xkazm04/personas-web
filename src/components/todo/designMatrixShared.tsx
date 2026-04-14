"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Target,
  Plug,
  Clock,
  UserCheck,
  MessageSquare,
  Brain,
  ShieldAlert,
  Radio,
  type LucideIcon,
} from "lucide-react";

/* ── Matrix cell vocabulary — mirrors personas/src/features/agents/components/matrix/cellVocabulary.ts ── */

export type CellKey =
  | "tasks"
  | "apps"
  | "triggers"
  | "review"
  | "messages"
  | "memory"
  | "errors"
  | "events";

export interface CellDef {
  key: CellKey;
  label: string;
  icon: LucideIcon;
  color: string;
  finalValue: string;
  question?: {
    prompt: string;
    options: string[];
    picked: number;
  };
}

export const CELLS: CellDef[] = [
  {
    key: "tasks",
    label: "Tasks",
    icon: Target,
    color: "#06b6d4",
    finalValue: "Triage inbox + draft replies for urgent",
  },
  {
    key: "apps",
    label: "Apps & Services",
    icon: Plug,
    color: "#a855f7",
    finalValue: "Gmail · Slack",
  },
  {
    key: "triggers",
    label: "When It Runs",
    icon: Clock,
    color: "#34d399",
    finalValue: "Every 15 minutes",
    question: {
      prompt: "How often should I check?",
      options: ["Every 15 min", "Every hour", "Real-time webhook"],
      picked: 0,
    },
  },
  {
    key: "review",
    label: "Human Review",
    icon: UserCheck,
    color: "#fbbf24",
    finalValue: "Approve drafts before sending",
    question: {
      prompt: "Send automatically or wait for approval?",
      options: ["Auto-send", "Approve first", "Ask only for urgent"],
      picked: 1,
    },
  },
  {
    key: "messages",
    label: "Messages",
    icon: MessageSquare,
    color: "#60a5fa",
    finalValue: "Post digest to #triage-inbox",
  },
  {
    key: "memory",
    label: "Memory",
    icon: Brain,
    color: "#ec4899",
    finalValue: "Learns sender priorities over time",
  },
  {
    key: "errors",
    label: "Errors",
    icon: ShieldAlert,
    color: "#f43f5e",
    finalValue: "Retry 3× then alert on Slack",
  },
  {
    key: "events",
    label: "Events",
    icon: Radio,
    color: "#f97316",
    finalValue: "Emits email.processed",
  },
];

export type CellState = "pending" | "thinking" | "asking" | "answered" | "filled";

export interface CellStatus {
  state: CellState;
  answer?: number;
}

export const USER_PROMPT =
  "Triage my Gmail inbox and draft replies for urgent emails.";

/* ── Shared animation state machine ──────────────────────────────── */

export interface PersonaMatrixState {
  statuses: Record<CellKey, CellStatus>;
  phase: "idle" | "running" | "done";
  userTyped: string;
  replay: () => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

export function usePersonaMatrixBuild(): PersonaMatrixState {
  const prefersReducedMotion = useReducedMotion();
  const [statuses, setStatuses] = useState<Record<CellKey, CellStatus>>(() =>
    Object.fromEntries(
      CELLS.map((c) => [c.key, { state: "pending" as CellState }]),
    ) as Record<CellKey, CellStatus>,
  );
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [userTyped, setUserTyped] = useState("");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasRun = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const setCell = useCallback((key: CellKey, state: CellState) => {
    setStatuses((prev) => ({ ...prev, [key]: { ...prev[key], state } }));
  }, []);

  const runBuild = useCallback(() => {
    clearAll();
    setPhase("running");
    setUserTyped("");
    setStatuses(
      Object.fromEntries(
        CELLS.map((c) => [c.key, { state: "pending" as CellState }]),
      ) as Record<CellKey, CellStatus>,
    );

    /* 1. Type the user prompt (3× slower so users can follow it) */
    let cumulative = 0;
    const typeSpeed = 90;
    for (let i = 1; i <= USER_PROMPT.length; i++) {
      const t = setTimeout(
        () => setUserTyped(USER_PROMPT.slice(0, i)),
        cumulative,
      );
      timeoutsRef.current.push(t);
      cumulative += typeSpeed;
    }
    cumulative += 1200;

    /* 2. Fill each cell in sequence — every transition 3× longer */
    CELLS.forEach((cell) => {
      const thinkT = setTimeout(
        () => setCell(cell.key, "thinking"),
        cumulative,
      );
      timeoutsRef.current.push(thinkT);
      cumulative += 1650;

      if (cell.question) {
        const askT = setTimeout(() => setCell(cell.key, "asking"), cumulative);
        timeoutsRef.current.push(askT);
        cumulative += 4200;

        const answerT = setTimeout(
          () => setCell(cell.key, "answered"),
          cumulative,
        );
        timeoutsRef.current.push(answerT);
        cumulative += 1800;
      }

      const fillT = setTimeout(() => setCell(cell.key, "filled"), cumulative);
      timeoutsRef.current.push(fillT);
      cumulative += 1200;
    });

    const doneT = setTimeout(() => setPhase("done"), cumulative + 600);
    timeoutsRef.current.push(doneT);
  }, [clearAll, setCell]);

  useEffect(() => {
    if (prefersReducedMotion || hasRun.current) return;
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          runBuild();
          obs.disconnect();
        }
      },
      { rootMargin: "-80px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [runBuild, prefersReducedMotion]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const replay = useCallback(() => {
    hasRun.current = false;
    runBuild();
  }, [runBuild]);

  return { statuses, phase, userTyped, replay, sectionRef };
}

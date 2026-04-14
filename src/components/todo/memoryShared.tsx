"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* ── Types ──────────────────────────────────────────────────────── */

export interface Memory {
  id: number;
  title: string;
  category: "learning" | "preference" | "technical" | "constraint";
  importance: number;
  source: string;
  tags: string[];
  addedAt: number;
}

export type Category = Memory["category"];

export const CATEGORIES: Category[] = [
  "learning",
  "preference",
  "technical",
  "constraint",
];

export const CATEGORY_META: Record<
  Category,
  { color: string; label: string; gradient: string }
> = {
  learning: {
    color: "#06b6d4",
    label: "Learning",
    gradient: "from-cyan-500/10 via-cyan-400/4 to-transparent",
  },
  preference: {
    color: "#a855f7",
    label: "Preference",
    gradient: "from-purple-500/10 via-purple-400/4 to-transparent",
  },
  technical: {
    color: "#fbbf24",
    label: "Technical",
    gradient: "from-amber-500/10 via-amber-400/4 to-transparent",
  },
  constraint: {
    color: "#f43f5e",
    label: "Constraint",
    gradient: "from-rose-500/10 via-rose-400/4 to-transparent",
  },
};

const NOW = Date.now();

const initialMemories: Memory[] = [
  { id: 1, title: "Slack #eng-alerts uses PagerDuty format", category: "learning", importance: 8, source: "Exec #847", tags: ["slack", "alerts"], addedAt: NOW - 60_000 },
  { id: 2, title: "User prefers bullet-point summaries", category: "preference", importance: 9, source: "Exec #823", tags: ["format", "ux"], addedAt: NOW - 55_000 },
  { id: 3, title: "Monday.com webhook requires custom headers", category: "technical", importance: 7, source: "Exec #815", tags: ["monday", "webhook"], addedAt: NOW - 50_000 },
  { id: 4, title: "Deploy window: Tue–Thu 10am–4pm only", category: "constraint", importance: 10, source: "Manual", tags: ["deploy", "schedule"], addedAt: NOW - 45_000 },
  { id: 5, title: "GitHub org uses squash-merge policy", category: "learning", importance: 6, source: "Exec #791", tags: ["github", "git"], addedAt: NOW - 40_000 },
];

const newMemoryPool: Omit<Memory, "id" | "addedAt">[] = [
  { title: "Stripe endpoint changed to /v2/events", category: "technical", importance: 7, source: "Exec #855", tags: ["stripe", "api"] },
  { title: "Team prefers morning notifications", category: "preference", importance: 5, source: "Exec #860", tags: ["timing", "notif"] },
  { title: "CI pipeline ~8min on main branch", category: "learning", importance: 6, source: "Exec #862", tags: ["ci", "performance"] },
  { title: "No deploys on Friday after 2pm", category: "constraint", importance: 9, source: "Manual", tags: ["deploy", "schedule"] },
  { title: "Jira boards use epic-based hierarchy", category: "technical", importance: 5, source: "Exec #870", tags: ["jira", "workflow"] },
];

/* ── Shared feed hook ───────────────────────────────────────────── */

export function useMemoryFeed() {
  const prefersReducedMotion = useReducedMotion();
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [freshId, setFreshId] = useState<number | null>(null);
  const nextIdRef = useRef(6);
  const poolIdxRef = useRef(0);

  const addMemory = useCallback(() => {
    const template = newMemoryPool[poolIdxRef.current % newMemoryPool.length];
    poolIdxRef.current++;
    const id = nextIdRef.current++;
    const mem: Memory = { ...template, id, addedAt: Date.now() };

    setMemories((prev) => {
      const next = [...prev, mem];
      const byCat: Record<string, Memory[]> = {};
      for (const m of next) {
        (byCat[m.category] ??= []).push(m);
      }
      const kept: Memory[] = [];
      for (const cat of CATEGORIES) {
        const list = (byCat[cat] ?? []).sort((a, b) => b.addedAt - a.addedAt);
        kept.push(...list.slice(0, 3));
      }
      return kept;
    });

    setFreshId(id);
    setTimeout(() => setFreshId((v) => (v === id ? null : v)), 1800);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(addMemory, 5500 + Math.random() * 2500);
    return () => clearInterval(id);
  }, [addMemory, prefersReducedMotion]);

  return { memories, freshId };
}

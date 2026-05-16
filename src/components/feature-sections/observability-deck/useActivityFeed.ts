"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { baseActivity, agentPool, eventPool, colorPool } from "./data";
import type { ActivityRow } from "./types";

export function useActivityFeed(filterPrefix: string | null) {
  const prefersReducedMotion = useReducedMotion();
  const [activity, setActivity] = useState<ActivityRow[]>(baseActivity);
  const [newRow, setNewRow] = useState<string | null>(null);

  const addRow = useCallback(() => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const agent = agentPool[Math.floor(Math.random() * agentPool.length)];
    const event = eventPool[Math.floor(Math.random() * eventPool.length)];
    const color = colorPool[Math.floor(Math.random() * colorPool.length)];
    const duration = event.includes("completed")
      ? `${(Math.random() * 4 + 0.5).toFixed(1)}s`
      : event.includes("started")
        ? "—"
        : `${Math.floor(Math.random() * 800 + 50)}ms`;
    const cost = event.includes("execution")
      ? `$${(Math.random() * 0.3).toFixed(2)}`
      : "$0.00";
    const row: ActivityRow = { time, agent, event, duration, cost, color };

    setActivity((prev) => [row, ...prev.slice(0, 5)]);
    setNewRow(time);
    setTimeout(() => setNewRow(null), 800);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(addRow, 3000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, [addRow, prefersReducedMotion]);

  const filtered = useMemo(
    () =>
      filterPrefix
        ? activity.filter((row) => row.event.startsWith(filterPrefix))
        : activity,
    [activity, filterPrefix],
  );

  return { activity: filtered, newRow };
}

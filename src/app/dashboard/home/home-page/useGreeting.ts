"use client";

import { useEffect, useState } from "react";

import { usePageVisibility } from "@/hooks/usePageVisibility";

interface GreetingLabels {
  morning: string;
  afternoon: string;
  evening: string;
}

const HOUR_TICK_MS = 60_000;

// Lazy init keeps new Date() out of the render path (React 19 purity).
// The minute-grain tick lets the greeting cross noon/6pm boundaries
// without a page reload — a user who opens at 11:50am sees "Good
// Afternoon" by 12:00. The interval is suspended while the tab is
// hidden and resumes with a fresh hour read on return, so a tab left
// open overnight wakes up showing the right greeting.
export function useGreeting(labels: GreetingLabels): string {
  const [hour, setHour] = useState(() => new Date().getHours());
  const hidden = usePageVisibility();

  useEffect(() => {
    if (hidden) return;
    queueMicrotask(() => setHour(new Date().getHours()));
    const interval = setInterval(() => setHour(new Date().getHours()), HOUR_TICK_MS);
    return () => clearInterval(interval);
  }, [hidden]);

  if (hour < 12) return labels.morning;
  if (hour < 18) return labels.afternoon;
  return labels.evening;
}

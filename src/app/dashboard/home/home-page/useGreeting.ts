"use client";

import { useEffect, useState } from "react";

interface GreetingLabels {
  morning: string;
  afternoon: string;
  evening: string;
}

const HOUR_TICK_MS = 60_000;

// Lazy init keeps new Date() out of the render path (React 19 purity).
// The minute-grain tick lets the greeting cross noon/6pm boundaries
// without a page reload — a user who opens at 11:50am sees "Good
// Afternoon" by 12:00.
export function useGreeting(labels: GreetingLabels): string {
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => setHour(new Date().getHours()), HOUR_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  if (hour < 12) return labels.morning;
  if (hour < 18) return labels.afternoon;
  return labels.evening;
}

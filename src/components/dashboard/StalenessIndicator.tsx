"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { Translations } from "@/i18n/en";
import { usePageVisibility } from "@/hooks/usePageVisibility";

function formatStaleness(seconds: number, t: Translations): string {
  if (seconds < 10) return t.dashboard.staleness.justNow;
  if (seconds < 60)
    return t.dashboard.staleness.secondsAgo.replace(
      "{n}",
      String(Math.round(seconds)),
    );
  const minutes = Math.round(seconds / 60);
  if (minutes < 60)
    return t.dashboard.staleness.minutesAgo.replace("{n}", String(minutes));
  const hours = Math.round(seconds / 3600);
  if (hours < 24)
    return t.dashboard.staleness.hoursAgo.replace("{n}", String(hours));
  const days = Math.round(seconds / 86400);
  return t.dashboard.staleness.daysAgo.replace("{n}", String(days));
}

interface Props {
  fetchedAt: number | null;
  error?: string | null;
  className?: string;
}

export default function StalenessIndicator({
  fetchedAt,
  error,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  const hidden = usePageVisibility();

  // The dashboard mounts ~5 of these in parallel; pausing while the
  // tab is hidden keeps the 10s tick from waking the page off-screen.
  // Resume with an immediate `now` update so the chip catches up to
  // any time that passed in the background.
  useEffect(() => {
    if (hidden) return;
    queueMicrotask(() => setNow(Date.now()));
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, [hidden]);

  if (error) {
    return (
      <span
        className={`flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/8 px-2 py-0.5 text-sm font-medium text-rose-400 ${className}`}
        role="status"
      >
        <AlertCircle className="h-3 w-3" />
        {t.dashboard.staleness.error}
      </span>
    );
  }

  if (fetchedAt === null) {
    return null;
  }

  const seconds = Math.max(0, (now - fetchedAt) / 1000);
  const label = formatStaleness(seconds, t);

  return (
    <span
      className={`flex items-center gap-1 text-sm text-muted-dark ${className}`}
      title={new Date(fetchedAt).toLocaleString()}
    >
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
}

"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import ViewGap from "@/components/dashboard/arrival/ViewGap";
import type { DashboardViewId } from "./views";

/** The held, shapeless gap while a view's chunk loads (the view draws its own frame). */
function ViewLoading() {
  return <ViewGap />;
}

function StageViewLoading() {
  return <ViewGap fill />;
}

/* One lazy chunk per view: the dashboard's first load is the shell only, and a
   view's code arrives the first time it is opened (or hovered in the nav). The
   loaders are kept beside the components so the nav can warm a chunk early;
   next/dynamic reuses the same module promise. */
const LOADERS = {
  personas: () => import("@/components/dashboard/views/personas"),
  notes: () => import("@/components/dashboard/views/notes"),
  home: () => import("@/components/dashboard/views/home"),
  reviews: () => import("@/components/dashboard/views/reviews"),
  executions: () => import("@/components/dashboard/views/executions"),
  events: () => import("@/components/dashboard/views/events"),
  observability: () => import("@/components/dashboard/views/observability"),
  leaderboard: () => import("@/components/dashboard/views/leaderboard"),
  sla: () => import("@/components/dashboard/views/sla"),
  incidents: () => import("@/components/dashboard/views/incidents"),
  health: () => import("@/components/dashboard/views/health"),
  knowledge: () => import("@/components/dashboard/views/knowledge"),
  messages: () => import("@/components/dashboard/views/messages"),
  director: () => import("@/components/dashboard/views/director"),
  settings: () => import("@/components/dashboard/views/settings"),
} satisfies Record<DashboardViewId, () => Promise<{ default: ComponentType }>>;

const VIEWS: Record<DashboardViewId, ComponentType> = {
  personas: dynamic(LOADERS.personas, { ssr: false, loading: StageViewLoading }),
  notes: dynamic(LOADERS.notes, { ssr: false, loading: ViewLoading }),
  home: dynamic(LOADERS.home, { ssr: false, loading: ViewLoading }),
  reviews: dynamic(LOADERS.reviews, { ssr: false, loading: ViewLoading }),
  executions: dynamic(LOADERS.executions, { ssr: false, loading: ViewLoading }),
  events: dynamic(LOADERS.events, { ssr: false, loading: ViewLoading }),
  observability: dynamic(LOADERS.observability, { ssr: false, loading: ViewLoading }),
  leaderboard: dynamic(LOADERS.leaderboard, { ssr: false, loading: ViewLoading }),
  sla: dynamic(LOADERS.sla, { ssr: false, loading: ViewLoading }),
  incidents: dynamic(LOADERS.incidents, { ssr: false, loading: ViewLoading }),
  health: dynamic(LOADERS.health, { ssr: false, loading: ViewLoading }),
  knowledge: dynamic(LOADERS.knowledge, { ssr: false, loading: ViewLoading }),
  messages: dynamic(LOADERS.messages, { ssr: false, loading: ViewLoading }),
  director: dynamic(LOADERS.director, { ssr: false, loading: ViewLoading }),
  settings: dynamic(LOADERS.settings, { ssr: false, loading: ViewLoading }),
};

export function viewComponent(id: DashboardViewId): ComponentType {
  return VIEWS[id];
}

/** Start downloading a view's chunk (nav hover / focus). Safe to call repeatedly. */
export function preloadView(id: DashboardViewId) {
  void LOADERS[id]().catch(() => {
    // A failed warm-up is harmless: the real mount retries and surfaces errors.
  });
}

/**
 * The views most sessions open next, warmed in idle time once the current
 * view has settled (registry: lazy-section-loading, "idle warm-up").
 */
const IDLE_WARM: DashboardViewId[] = ["home", "reviews", "executions", "observability", "events"];

/**
 * Warm the likely-next view chunks one per idle callback, skipping the one on
 * screen. Polite by construction: never on save-data / 2g, never competing
 * with the current view (the first warm waits for a quiet main thread).
 * Returns a cancel function.
 */
export function warmLikelyViews(current: DashboardViewId | null): () => void {
  if (typeof window === "undefined" || !("requestIdleCallback" in window)) return () => {};
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return () => {};

  const queue = IDLE_WARM.filter((id) => id !== current);
  let handle = 0;
  const next = () => {
    const id = queue.shift();
    if (!id) return;
    preloadView(id);
    handle = window.requestIdleCallback(next, { timeout: 4000 });
  };
  // Give the current view's own deep slots the first idle windows.
  const start = setTimeout(() => {
    handle = window.requestIdleCallback(next, { timeout: 4000 });
  }, 1500);
  return () => {
    clearTimeout(start);
    window.cancelIdleCallback(handle);
  };
}

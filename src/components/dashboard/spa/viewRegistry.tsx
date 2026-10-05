"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import StageLoading from "@/components/dashboard/fleet-monitor/StageLoading";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import type { DashboardViewId } from "./views";

/** Placeholder while a padded view's chunk loads. */
function ViewLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

/* One lazy chunk per view: the dashboard's first load is the shell only, and a
   view's code arrives the first time it is opened (or hovered in the nav). The
   loaders are kept beside the components so the nav can warm a chunk early;
   next/dynamic reuses the same module promise. */
const LOADERS = {
  personas: () => import("@/components/dashboard/views/personas"),
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
  personas: dynamic(LOADERS.personas, { ssr: false, loading: StageLoading }),
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

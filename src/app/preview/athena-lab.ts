"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

/**
 * Athena lab (dev-only, under /preview/lab-athena-*): prototype variants for
 * the /athena review of 2026-10-06. Each slot renders bare, the way
 * app/athena/page.tsx mounts its sections: every section paints its own
 * AthenaStage, so there is no StageSection wrapper. `ssr: false` like
 * athena-lazy.tsx.
 */
const slot = (load: () => Promise<{ default: ComponentType }>) => dynamic(load, { ssr: false });

export const ATHENA_LAB_EXTRAS: Record<string, ComponentType> = {
  "lab-athena-hero-v1": slot(() => import("@/components/athena-lab/hero/v1")),
  "lab-athena-hero-v2": slot(() => import("@/components/athena-lab/hero/v2")),
  "lab-athena-hero-v3": slot(() => import("@/components/athena-lab/hero/v3")),
  "lab-athena-onboarding-v1": slot(() => import("@/components/athena-lab/onboarding/v1")),
  "lab-athena-onboarding-v2": slot(() => import("@/components/athena-lab/onboarding/v2")),
  "lab-athena-onboarding-v3": slot(() => import("@/components/athena-lab/onboarding/v3")),
  "lab-athena-fleet-v1": slot(() => import("@/components/athena-lab/fleet/v1")),
  "lab-athena-fleet-v2": slot(() => import("@/components/athena-lab/fleet/v2")),
  "lab-athena-fleet-v3": slot(() => import("@/components/athena-lab/fleet/v3")),
  "lab-athena-workshop-v1": slot(() => import("@/components/athena-lab/workshop/v1")),
  "lab-athena-workshop-v2": slot(() => import("@/components/athena-lab/workshop/v2")),
  "lab-athena-workshop-v3": slot(() => import("@/components/athena-lab/workshop/v3")),
  "lab-athena-portfolio-v1": slot(() => import("@/components/athena-lab/portfolio/v1")),
  "lab-athena-portfolio-v2": slot(() => import("@/components/athena-lab/portfolio/v2")),
  "lab-athena-portfolio-v3": slot(() => import("@/components/athena-lab/portfolio/v3")),
  "lab-athena-memory-v1": slot(() => import("@/components/athena-lab/memory/v1")),
  "lab-athena-memory-v2": slot(() => import("@/components/athena-lab/memory/v2")),
  "lab-athena-memory-v3": slot(() => import("@/components/athena-lab/memory/v3")),
  "lab-athena-one-mind-v1": slot(() => import("@/components/athena-lab/one-mind/v1")),
  "lab-athena-one-mind-v2": slot(() => import("@/components/athena-lab/one-mind/v2")),
  "lab-athena-one-mind-v3": slot(() => import("@/components/athena-lab/one-mind/v3")),
};

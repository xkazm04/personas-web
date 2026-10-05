"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { labFrame } from "./LabFrame";

/**
 * Landing lab (dev-only, under /preview/lab-*): prototype variants for the
 * landing review of 2026-10-05. Each slot renders inside the same stage
 * wrapper the live page uses (LabFrame), so a variant is judged at its real
 * one-viewport size. Hero slots a1-a3 / b1-b3 are the two blind contest
 * seats; the seat-to-model map lives in the contest vault, not here.
 */
export const LAB_EXTRAS: Record<string, ComponentType> = {
  "lab-hero-a1": labFrame(dynamic(() => import("@/components/landing-lab/hero/a1")), "hero"),
  "lab-hero-a2": labFrame(dynamic(() => import("@/components/landing-lab/hero/a2")), "hero"),
  "lab-hero-a3": labFrame(dynamic(() => import("@/components/landing-lab/hero/a3")), "hero"),
  "lab-hero-b1": labFrame(dynamic(() => import("@/components/landing-lab/hero/b1")), "hero"),
  "lab-hero-b2": labFrame(dynamic(() => import("@/components/landing-lab/hero/b2")), "hero"),
  "lab-hero-b3": labFrame(dynamic(() => import("@/components/landing-lab/hero/b3")), "hero"),
  "lab-use-cases-v1": labFrame(dynamic(() => import("@/components/landing-lab/use-cases/v1")), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-use-cases-v2": labFrame(dynamic(() => import("@/components/landing-lab/use-cases/v2")), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-use-cases-v3": labFrame(dynamic(() => import("@/components/landing-lab/use-cases/v3")), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-agent-mind-v1": labFrame(dynamic(() => import("@/components/landing-lab/agent-mind/v1")), { glow: "cyan", fromColor: "emerald", toColor: "cyan" }),
  "lab-agent-mind-v2": labFrame(dynamic(() => import("@/components/landing-lab/agent-mind/v2")), { glow: "cyan", fromColor: "emerald", toColor: "cyan" }),
  "lab-agent-mind-v3": labFrame(dynamic(() => import("@/components/landing-lab/agent-mind/v3")), { glow: "cyan", fromColor: "emerald", toColor: "cyan" }),
  "lab-orchestration-hub-v1": labFrame(dynamic(() => import("@/components/landing-lab/orchestration-hub/v1")), { glow: "cyan", fromColor: "emerald", toColor: "cyan" }),
  "lab-orchestration-hub-v2": labFrame(dynamic(() => import("@/components/landing-lab/orchestration-hub/v2")), { glow: "cyan", fromColor: "emerald", toColor: "cyan" }),
  "lab-orchestration-hub-v3": labFrame(dynamic(() => import("@/components/landing-lab/orchestration-hub/v3")), { glow: "cyan", fromColor: "emerald", toColor: "cyan" }),
  "lab-get-started-v1": labFrame(dynamic(() => import("@/components/landing-lab/get-started/v1")), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-get-started-v2": labFrame(dynamic(() => import("@/components/landing-lab/get-started/v2")), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-get-started-v3": labFrame(dynamic(() => import("@/components/landing-lab/get-started/v3")), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
};

"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { howLabFrame } from "./HowLabFrame";

/**
 * How lab (dev-only, under /preview/lab-how-*): prototype variants for the /how
 * review of 2026-10-06. Each slot renders inside the same StageSection
 * app/how/page.tsx mounts its section in (HowLabFrame), `ssr: false` like
 * how-lazy.tsx.
 */
export const HOW_LAB_EXTRAS: Record<string, ComponentType> = {
  "lab-how-timeline-v1": howLabFrame(dynamic(() => import("@/components/how-lab/timeline/v1"), { ssr: false }), { glow: "cyan", toColor: "cyan" }),
  "lab-how-timeline-v2": howLabFrame(dynamic(() => import("@/components/how-lab/timeline/v2"), { ssr: false }), { glow: "cyan", toColor: "cyan" }),
  "lab-how-timeline-v3": howLabFrame(dynamic(() => import("@/components/how-lab/timeline/v3"), { ssr: false }), { glow: "cyan", toColor: "cyan" }),
  "lab-how-chat-v1": howLabFrame(dynamic(() => import("@/components/how-lab/chat/v1"), { ssr: false }), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-how-chat-v2": howLabFrame(dynamic(() => import("@/components/how-lab/chat/v2"), { ssr: false }), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-how-chat-v3": howLabFrame(dynamic(() => import("@/components/how-lab/chat/v3"), { ssr: false }), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-how-layers-v1": howLabFrame(dynamic(() => import("@/components/how-lab/layers/v1"), { ssr: false }), { glow: "purple", fromColor: "emerald", toColor: "purple" }),
  "lab-how-layers-v2": howLabFrame(dynamic(() => import("@/components/how-lab/layers/v2"), { ssr: false }), { glow: "purple", fromColor: "emerald", toColor: "purple" }),
  "lab-how-layers-v3": howLabFrame(dynamic(() => import("@/components/how-lab/layers/v3"), { ssr: false }), { glow: "purple", fromColor: "emerald", toColor: "purple" }),
  "lab-how-events-v1": howLabFrame(dynamic(() => import("@/components/how-lab/events/v1"), { ssr: false }), { glow: "cyan", fromColor: "emerald", toColor: "cyan" }),
  "lab-how-events-v2": howLabFrame(dynamic(() => import("@/components/how-lab/events/v2"), { ssr: false }), { glow: "cyan", fromColor: "emerald", toColor: "cyan" }),
  "lab-how-events-v3": howLabFrame(dynamic(() => import("@/components/how-lab/events/v3"), { ssr: false }), { glow: "cyan", fromColor: "emerald", toColor: "cyan" }),
};

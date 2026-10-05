"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { labFrame } from "./LabFrame";

/**
 * Features lab (dev-only, under /preview/lab-*): prototype variants for the
 * /features review of 2026-10-05. Each slot renders inside the same
 * StageSection the live page uses (LabFrame), so a variant is judged at its
 * real one-viewport size.
 */
export const LAB_EXTRAS: Record<string, ComponentType> = {
  "lab-design-v1": labFrame(dynamic(() => import("@/components/features-lab/design/v1")), { glow: "purple", fromColor: "purple", toColor: "purple" }),
  "lab-design-v2": labFrame(dynamic(() => import("@/components/features-lab/design/v2")), { glow: "purple", fromColor: "purple", toColor: "purple" }),
  "lab-design-v3": labFrame(dynamic(() => import("@/components/features-lab/design/v3")), { glow: "purple", fromColor: "purple", toColor: "purple" }),
  "lab-memory-v1": labFrame(dynamic(() => import("@/components/features-lab/memory/v1")), { glow: "purple", fromColor: "purple", toColor: "purple" }),
  "lab-memory-v2": labFrame(dynamic(() => import("@/components/features-lab/memory/v2")), { glow: "purple", fromColor: "purple", toColor: "purple" }),
  "lab-memory-v3": labFrame(dynamic(() => import("@/components/features-lab/memory/v3")), { glow: "purple", fromColor: "purple", toColor: "purple" }),
  "lab-healing-v1": labFrame(dynamic(() => import("@/components/features-lab/healing/v1")), { glow: "emerald", fromColor: "purple", toColor: "rose" }),
  "lab-healing-v2": labFrame(dynamic(() => import("@/components/features-lab/healing/v2")), { glow: "emerald", fromColor: "purple", toColor: "rose" }),
  "lab-healing-v3": labFrame(dynamic(() => import("@/components/features-lab/healing/v3")), { glow: "emerald", fromColor: "purple", toColor: "rose" }),
  "lab-models-v1": labFrame(dynamic(() => import("@/components/features-lab/models/v1")), { glow: "cyan", fromColor: "rose", toColor: "cyan" }),
  "lab-models-v2": labFrame(dynamic(() => import("@/components/features-lab/models/v2")), { glow: "cyan", fromColor: "rose", toColor: "cyan" }),
  "lab-models-v3": labFrame(dynamic(() => import("@/components/features-lab/models/v3")), { glow: "cyan", fromColor: "rose", toColor: "cyan" }),
  "lab-observe-v1": labFrame(dynamic(() => import("@/components/features-lab/observe/v1")), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-observe-v2": labFrame(dynamic(() => import("@/components/features-lab/observe/v2")), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-observe-v3": labFrame(dynamic(() => import("@/components/features-lab/observe/v3")), { glow: "emerald", fromColor: "cyan", toColor: "emerald" }),
  "lab-plugins-v1": labFrame(dynamic(() => import("@/components/features-lab/plugins/v1")), { glow: "purple", fromColor: "cyan", toColor: "purple" }),
  "lab-plugins-v2": labFrame(dynamic(() => import("@/components/features-lab/plugins/v2")), { glow: "purple", fromColor: "cyan", toColor: "purple" }),
  "lab-plugins-v3": labFrame(dynamic(() => import("@/components/features-lab/plugins/v3")), { glow: "purple", fromColor: "cyan", toColor: "purple" }),
};

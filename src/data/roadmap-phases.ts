import {
  Cpu, Database, MessageSquare, Zap, Settings, Globe, Shield, Bot, Code, Layers, Calendar,
  Wifi, FileText, Lock, Rocket,
  type LucideIcon,
} from "lucide-react";

import { LANGUAGES } from "@/stores/i18nStore";

/**
 * Shape of a single roadmap phase card. (Formerly declared in the now-removed
 * `PhaseCard` component; moved here to sit next to its only data.)
 */
export type PhaseCardData = {
  phase: number;
  name: string;
  icon: LucideIcon;
  scope: string;
  accent: string;
  bg: string;
  completed?: boolean;
};

/**
 * Provenance of the numbers in this table — same discipline as
 * `components/sections/roadmap/areas.ts`.
 *
 * DERIVED (correct forever, recomputed from the shipped artifact):
 * - The locale count in phase 6's scope comes from the `LANGUAGES` registry
 *   (`@/stores/i18nStore`), the same list the language switcher renders and
 *   the same one `roadmap-area-counts.ts` reduces to `localeTotal`. It read
 *   "15+" while the registry held 14. Importing the registry here is free:
 *   every consumer of this module is a client component that already pulls
 *   `i18nStore` in via `useTranslation`.
 * - `completedCount` / `totalPhases` / `progressPercent` below are reductions
 *   over this array, so flipping a `completed` flag moves the public progress
 *   bar in lockstep.
 *
 * HAND-AUTHORED (correct on the day it was written — a commitment, not a
 * measurement):
 * - Phase 9's "40+ service integrations" is a deliberate floor, not a count.
 *   The real figure is `connectors.length` (125 today), but `@/data/connectors`
 *   is a ~1600-line catalog and this module is imported by CLIENT components
 *   (`RoadmapProgress`, `command-center-geometry`), so importing it here would
 *   ship the whole catalog in the first chunk a visitor parses. The derived
 *   number is already published server-side as `AREA_COUNTS.connectors`
 *   (`roadmap-area-counts.ts`) and rendered by the roadmap "Platform" card; if
 *   this scope line ever becomes visible, source it from there instead.
 * - Every other `scope` string is editorial prose with no data source.
 *
 * REACHABILITY: these `scope` strings currently render NOWHERE — the
 * `PhaseCard` component that consumed them was removed and only the derived
 * counters at the bottom of this file are imported. They are kept accurate
 * because the next component to pick this array up will publish them as-is.
 */
export const phaseCardData: PhaseCardData[] = [
  { phase: 1,  name: "Core Engine",         icon: Cpu,              scope: "The foundation that runs your agents",       accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 2,  name: "Data Layer",          icon: Database,         scope: "Where your agents save their work and settings", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 3,  name: "Agent Messaging",     icon: MessageSquare,    scope: "How agents talk to each other",              accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 4,  name: "Event Bus",           icon: Zap,              scope: "The system that connects actions to reactions", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 5,  name: "Configuration",       icon: Settings,         scope: "Controls for customizing how your agents behave", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  // DERIVED: locale count from the LANGUAGES registry (14 today).
  { phase: 6,  name: "Internationalization",icon: Globe,            scope: `Support for ${LANGUAGES.length} languages worldwide`, accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 7,  name: "Auth & Security",     icon: Shield,           scope: "Bank-grade encryption for all your credentials", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 8,  name: "Agent Templates",     icon: Bot,              scope: "Pre-built agents you can start using immediately", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  // HAND-AUTHORED FLOOR (not a count): the catalog ships 125 connectors, but
  // deriving it here would drag @/data/connectors into the client bundle.
  // Derived figure lives in AREA_COUNTS.connectors (server-side).
  { phase: 9,  name: "Tool Integrations",   icon: Code,             scope: "40+ service integrations built in",          accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 10, name: "Orchestration",       icon: Layers,           scope: "Wire multiple agents together into pipelines", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 11, name: "Scheduling",          icon: Calendar,         scope: "Run agents on any schedule — hourly, daily, or custom", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 12, name: "Cloud Integration",   icon: Wifi,             scope: "Run agents 24/7, even when your computer is off", accent: "text-brand-cyan",    bg: "bg-brand-cyan/10" },
  { phase: 13, name: "Web App",             icon: FileText,         scope: "Sign up, manage your account, explore online", accent: "text-brand-purple",  bg: "bg-brand-purple/10" },
  { phase: 14, name: "Cloud Evolution",     icon: Lock,             scope: "Faster, safer cloud with usage tracking",    accent: "text-brand-emerald", bg: "bg-brand-emerald/10" },
  { phase: 15, name: "Distribution",        icon: Rocket,           scope: "One-click install, auto-updates, polished experience", accent: "text-brand-amber",   bg: "bg-brand-amber/10" },
];

// Derived progress from phaseCardData — single source of truth
export const completedCount = phaseCardData.filter((p) => p.completed).length;
export const totalPhases = phaseCardData.length;
export const remainingCount = totalPhases - completedCount;
export const progressPercent = Math.round((completedCount / totalPhases) * 100);
export const progressWidth = `${progressPercent}%`;

import { Brain, CheckCircle2, Inbox, Radio, Search, ShieldCheck, UserCheck, Wrench, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";
import type { ResultCapabilities } from "@/components/sections/playground-split/types";
import { BEATS, type BeatId, type MindRun } from "./useMindRun";

/** One brand accent per beat; the tools beat colours each tool instead. */
export const BEAT_BRAND: Record<BeatId, BrandKey> = {
  parse: "cyan",
  select: "purple",
  tools: "blue",
  execute: "amber",
  verify: "emerald",
  result: "emerald",
};

export const BEAT_ICON: Record<Exclude<BeatId, "tools">, LucideIcon> = {
  parse: Search,
  select: Wrench,
  execute: Zap,
  verify: ShieldCheck,
  result: CheckCircle2,
};

/** Tool accents by position (the live section's cyan / purple / rose). */
export const TOOL_BRAND: BrandKey[] = ["cyan", "purple", "rose"];

/** Example chip accents (the live data's raw hex, one of which is near-black). */
export const EXAMPLE_BRAND: BrandKey[] = ["rose", "purple", "amber", "cyan"];

export const DIMENSIONS: { key: keyof ResultCapabilities; icon: LucideIcon; brand: BrandKey }[] = [
  { key: "messages", icon: Inbox, brand: "cyan" },
  { key: "humanReview", icon: UserCheck, brand: "amber" },
  { key: "events", icon: Radio, brand: "purple" },
  { key: "memories", icon: Brain, brand: "emerald" },
];

/** The beat's name, in the live section's words. */
export function beatTitle(run: MindRun, beat: number): string {
  const id = BEATS[beat];
  if (id === "tools") return run.example.tools.map((t) => t.label).join(" + ");
  return run.copy.nodes[id];
}

/** The concrete thing this beat produced for the shown prompt. */
export function beatDetail(run: MindRun, beat: number): string {
  const ex = run.example;
  switch (BEATS[beat]) {
    case "parse":
      return ex.intentText;
    case "select":
      return ex.tools.map((t) => t.label).join(" · ");
    case "tools":
      return ex.result.messages;
    case "execute":
      return ex.result.events;
    case "verify":
      return ex.result.humanReview;
    default:
      return ex.result.memories;
  }
}

/** Plain-language caption of what the beat does for the visitor. */
export function beatCaption(run: MindRun, beat: number): string {
  return run.lab.beats[BEATS[beat]];
}

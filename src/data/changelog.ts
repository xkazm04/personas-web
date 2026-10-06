/* ── Desktop app changelog / release history ───────────────────────── */

import type { BrandKey } from "@/lib/brand-theme";

export type ChangeType = "feature" | "improvement" | "fix" | "breaking";

export interface ChangeItem {
  text: string;
  type: ChangeType;
}

export interface Release {
  version: string;
  date: string;
  summary: string;
  changes: ChangeItem[];
}

// Single source of truth for change-type styling. `brand` keys into the
// brand-theme token system (the timeline resolves it to colors); per-type icons
// stay component-side (keyed by ChangeType) since they carry a React dependency.
export const CHANGE_TYPE_META: Record<ChangeType, { label: string; brand: BrandKey }> = {
  feature: { label: "New", brand: "emerald" },
  improvement: { label: "Improved", brand: "cyan" },
  fix: { label: "Fixed", brand: "amber" },
  breaking: { label: "Breaking", brand: "rose" },
};

export const RELEASES: Release[] = [
  {
    version: "1.1.0",
    date: "2026-07-16",
    summary: "Cross-device Athena, conversational fleet dispatch, and portable workspaces",
    changes: [
      { text: "Pair two machines and let your Athena hand work to the other device's Athena, with progress streamed back", type: "feature" },
      { text: "Digital twins and Athena's memory export in encrypted workspace bundles and move to another machine", type: "feature" },
      { text: "Ask Athena for a fleet plan in chat — editable session rows, confirm once to launch up to eight sessions", type: "feature" },
      { text: "Athena steers the Mastermind canvas — camera travel, island framing, and on-surface improvement popovers", type: "feature" },
      { text: "Approved-work dispatch panel shows what you approved and whether it was actually sent", type: "feature" },
      { text: "Finished fleet sessions announce completion instead of waiting to be noticed", type: "improvement" },
      { text: "Dev merges verify content landed on HEAD before pruning — a refused merge no longer strands work", type: "fix" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-07-10",
    summary: "Mastermind command canvas and consolidated scan sweeps",
    changes: [
      { text: "Mastermind hex canvas is the primary channel into the dev-tools layers, with Ship milestone chips and Factory deep links", type: "feature" },
      { text: "Athena reads, annotates, and composes panels on the Mastermind canvas", type: "feature" },
      { text: "scan-sweep — one scan reads a context once and every matched lens judges it, with findings landing in the backlog", type: "feature" },
      { text: "Run a Ship milestone as a Claude Code skill and ingest its results through one validated door", type: "feature" },
      { text: "Dev projects and workspace knowledge travel with workspace exports", type: "feature" },
      { text: "Staggered island hydration — the canvas opens instantly and data ripples in without freezing", type: "improvement" },
      { text: "The 22 single-lens scan skills are retired — scan-sweep is the only scan entry point", type: "breaking" },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-04-14",
    summary: "Design review and quality gates",
    changes: [
      { text: "Automated design review generation for agent outputs", type: "feature" },
      { text: "Manual review queue with approval workflow", type: "feature" },
      { text: "Test suite runner with mock tools and scenario validation", type: "feature" },
      { text: "Quality scoring and prompt performance benchmarking", type: "improvement" },
    ],
  },
];

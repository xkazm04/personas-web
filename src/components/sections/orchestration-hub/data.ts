import {
  Clock,
  Webhook,
  Radio,
  FolderOpen,
  Clipboard,
  Focus,
  Layers,
  RefreshCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

/**
 * Real trigger catalog — mirrors personas/src/features/triggers/sub_triggers/configs.
 * Each trigger maps to a brand key (not hex) so it adapts to light themes.
 */

export interface TriggerDef {
  id: string;
  label: string;
  icon: LucideIcon;
  brand: BrandKey;
  example: string;
  persona: string;
}

export const TRIGGERS: TriggerDef[] = [
  {
    id: "schedule",
    label: "Schedule",
    icon: Clock,
    brand: "cyan",
    example: "Every morning at 08:00",
    persona: "Morning Brief",
  },
  {
    id: "polling",
    label: "Polling",
    icon: RefreshCcw,
    brand: "emerald",
    example: "Every 5 min on Jira",
    persona: "Blocker Watcher",
  },
  {
    id: "webhook",
    label: "Webhook",
    icon: Webhook,
    brand: "purple",
    example: "POST /github/pr.opened",
    persona: "PR Reviewer",
  },
  {
    id: "file",
    label: "File watcher",
    icon: FolderOpen,
    brand: "amber",
    example: "~/inbox/*.pdf",
    persona: "Doc Parser",
  },
  {
    id: "clipboard",
    label: "Clipboard",
    icon: Clipboard,
    brand: "rose",
    example: "On copy of URL",
    persona: "Link Archiver",
  },
  {
    id: "focus",
    label: "App focus",
    icon: Focus,
    brand: "purple",
    example: "Switch to Figma",
    persona: "Design Notes",
  },
  {
    id: "event",
    label: "Event",
    icon: Radio,
    brand: "emerald",
    example: "digest.ready",
    persona: "Delivery Agent",
  },
  {
    id: "composite",
    label: "Composite",
    icon: Layers,
    brand: "blue",
    example: "Schedule AND webhook",
    persona: "Gate Agent",
  },
];

/* Ring geometry — exported so the visual and helper share one source. */
export const CENTER = 260;
export const RADIUS = 200;
export const NODE_SIZE = 96;
export const AUTO_CYCLE_MS = 3200;

export function nodePosition(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * RADIUS,
    y: CENTER + Math.sin(angle) * RADIUS,
  };
}

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

export interface DocRef {
  label: string;
  href: string;
}

export interface TriggerDef {
  id: string;
  label: string;
  icon: LucideIcon;
  brand: BrandKey;
  description: string;
  example: string;
  persona: string;
  doc?: DocRef;
}

export const TRIGGERS: TriggerDef[] = [
  {
    id: "schedule",
    label: "Schedule",
    icon: Clock,
    brand: "cyan",
    description:
      "Runs on a time-based schedule — a cron expression, a fixed interval, or a specific calendar time.",
    example: "Every morning at 08:00",
    persona: "Morning Brief",
    doc: { label: "Schedule triggers guide", href: "/guide/triggers/schedule-triggers" },
  },
  {
    id: "polling",
    label: "Polling",
    icon: RefreshCcw,
    brand: "emerald",
    description:
      "Checks an external source on a fixed interval and fires when it detects a new or changed item.",
    example: "Every 5 min on Jira",
    persona: "Blocker Watcher",
    doc: { label: "How triggers work", href: "/guide/triggers/how-triggers-work" },
  },
  {
    id: "webhook",
    label: "Webhook",
    icon: Webhook,
    brand: "purple",
    description:
      "Exposes a public URL; fires the moment an external service sends it a payload.",
    example: "POST /github/pr.opened",
    persona: "PR Reviewer",
    doc: { label: "Webhook triggers guide", href: "/guide/triggers/webhook-triggers" },
  },
  {
    id: "file",
    label: "File watcher",
    icon: FolderOpen,
    brand: "amber",
    description:
      "Watches a folder path and fires whenever files are created, modified, or removed.",
    example: "~/inbox/*.pdf",
    persona: "Doc Parser",
    doc: { label: "File watcher guide", href: "/guide/triggers/file-watcher-triggers" },
  },
  {
    id: "clipboard",
    label: "Clipboard",
    icon: Clipboard,
    brand: "rose",
    description:
      "Fires when the OS clipboard receives content matching a pattern — URLs, tokens, or snippets.",
    example: "On copy of URL",
    persona: "Link Archiver",
    doc: { label: "Clipboard monitor", href: "/guide/triggers/clipboard-monitor" },
  },
  {
    id: "focus",
    label: "App focus",
    icon: Focus,
    brand: "purple",
    description:
      "Fires when you switch to a specific application window, so agents adapt to your current task.",
    example: "Switch to Figma",
    persona: "Design Notes",
    doc: { label: "How triggers work", href: "/guide/triggers/how-triggers-work" },
  },
  {
    id: "event",
    label: "Event",
    icon: Radio,
    brand: "emerald",
    description:
      "Fires when another persona emits a named event on the internal event bus.",
    example: "digest.ready",
    persona: "Delivery Agent",
    doc: { label: "Event-based triggers", href: "/guide/triggers/event-based-triggers" },
  },
  {
    id: "composite",
    label: "Composite",
    icon: Layers,
    brand: "blue",
    description:
      "Fires only when multiple underlying triggers satisfy a boolean condition together.",
    example: "Schedule AND webhook",
    persona: "Gate Agent",
    doc: { label: "Combining multiple triggers", href: "/guide/triggers/combining-multiple-triggers" },
  },
];

/* Ring geometry — exported so the visual and helper share one source. */
export const CENTER = 260;
export const RADIUS = 200;
export const NODE_SIZE = 96;
export const AUTO_CYCLE_MS = 9600;

export function nodePosition(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * RADIUS,
    y: CENTER + Math.sin(angle) * RADIUS,
  };
}

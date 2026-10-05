import {
  Clock,
  Webhook,
  Radio,
  FolderOpen,
  Clipboard,
  Focus,
  Layers,
  Link,
  MousePointerClick,
  RefreshCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";
import type { Translations } from "@/i18n/en";

/**
 * Real trigger catalog — mirrors personas/src/features/triggers/sub_triggers/configs.
 * Each trigger maps to a brand key (not hex) so it adapts to light themes.
 * Identity, icon and links live here; every label, description, sample
 * persona and natural-language firing condition is translated copy in
 * `t.orchestrationSection` (see `triggerWords`). A firing condition that is
 * code (a route, a glob, an event name) stays here as `exampleCode`.
 */

type OrchestrationCopy = Translations["orchestrationSection"];
export type TriggerId = keyof OrchestrationCopy["triggers"];

export interface DocRef {
  labelKey: keyof OrchestrationCopy["docs"];
  href: string;
}

export interface TriggerDef {
  id: TriggerId;
  icon: LucideIcon;
  brand: BrandKey;
  exampleCode?: string;
  doc?: DocRef;
}

export const TRIGGERS: TriggerDef[] = [
  {
    id: "schedule",
    icon: Clock,
    brand: "cyan",
    doc: { labelKey: "scheduleGuide", href: "/guide/triggers/schedule-triggers" },
  },
  {
    id: "polling",
    icon: RefreshCcw,
    brand: "emerald",
    doc: { labelKey: "howTriggersWork", href: "/guide/triggers/how-triggers-work" },
  },
  {
    id: "webhook",
    icon: Webhook,
    brand: "purple",
    exampleCode: "POST /github/pr.opened",
    doc: { labelKey: "webhookGuide", href: "/guide/triggers/webhook-triggers" },
  },
  {
    id: "file",
    icon: FolderOpen,
    brand: "amber",
    exampleCode: "~/inbox/*.pdf",
    doc: { labelKey: "fileWatcherGuide", href: "/guide/triggers/file-watcher-triggers" },
  },
  {
    id: "clipboard",
    icon: Clipboard,
    brand: "rose",
    doc: { labelKey: "clipboardMonitor", href: "/guide/triggers/clipboard-monitor" },
  },
  {
    id: "focus",
    icon: Focus,
    brand: "purple",
    doc: { labelKey: "howTriggersWork", href: "/guide/triggers/how-triggers-work" },
  },
  {
    id: "event",
    icon: Radio,
    brand: "emerald",
    exampleCode: "digest.ready",
    doc: { labelKey: "eventBased", href: "/guide/triggers/event-based-triggers" },
  },
  {
    id: "chain",
    icon: Link,
    brand: "purple",
    doc: { labelKey: "chainGuide", href: "/guide/triggers/chain-triggers" },
  },
  {
    id: "composite",
    icon: Layers,
    brand: "blue",
    doc: { labelKey: "combining", href: "/guide/triggers/combining-multiple-triggers" },
  },
  {
    id: "manual",
    icon: MousePointerClick,
    brand: "cyan",
    doc: { labelKey: "howTriggersWork", href: "/guide/triggers/how-triggers-work" },
  },
];

/** A trigger's translated words, with a code-shaped firing condition kept verbatim. */
export function triggerWords(copy: OrchestrationCopy, trigger: TriggerDef) {
  const words = copy.triggers[trigger.id];
  return {
    label: words.label,
    description: words.description,
    persona: words.persona,
    example: trigger.exampleCode ?? ("example" in words ? words.example : ""),
    docLabel: trigger.doc ? copy.docs[trigger.doc.labelKey] : undefined,
  };
}

/** How long the hub dwells on a trigger before auto-advancing. */
export const AUTO_CYCLE_MS = 9600;

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
import type { TriggerKind } from "@/lib/product-facts";
import type { BrandKey } from "@/lib/brand-theme";
import type { OrchestrationSectionCopy } from "@/i18n/pending/orchestrationSection";

/**
 * Real trigger catalog — mirrors personas/src/features/triggers/sub_triggers/configs.
 * Ids are the desktop's `TriggerKind` spelling (data.test.ts holds the snapshot).
 * Each trigger maps to a brand key (not hex) so it adapts to light themes.
 * Identity, icon and links live here; every label, description, sample
 * persona and natural-language firing condition is translated copy in
 * `orchestrationSectionCopy` (see `triggerWords`). A firing condition that is
 * code (a route, a glob, an event name) stays here as `exampleCode`.
 */

type OrchestrationCopy = OrchestrationSectionCopy;
export type TriggerId = TriggerKind;

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

/**
 * Keyed by the desktop's `TriggerKind`, so the record is total: a kind the app
 * adds fails `tsc` here until it has an icon and a brand, and a kind it drops
 * is an excess-property error rather than a phantom feature. Insertion order is
 * the hub's display order.
 */
const TRIGGER_NODES: Record<TriggerKind, Omit<TriggerDef, "id">> = {
  schedule: {
    icon: Clock,
    brand: "cyan",
    doc: { labelKey: "scheduleGuide", href: "/guide/triggers/schedule-triggers" },
  },
  polling: {
    icon: RefreshCcw,
    brand: "emerald",
    doc: { labelKey: "howTriggersWork", href: "/guide/triggers/how-triggers-work" },
  },
  webhook: {
    icon: Webhook,
    brand: "purple",
    exampleCode: "POST /github/pr.opened",
    doc: { labelKey: "webhookGuide", href: "/guide/triggers/webhook-triggers" },
  },
  file_watcher: {
    icon: FolderOpen,
    brand: "amber",
    exampleCode: "~/inbox/*.pdf",
    doc: { labelKey: "fileWatcherGuide", href: "/guide/triggers/file-watcher-triggers" },
  },
  clipboard: {
    icon: Clipboard,
    brand: "rose",
    doc: { labelKey: "clipboardMonitor", href: "/guide/triggers/clipboard-monitor" },
  },
  app_focus: {
    icon: Focus,
    brand: "purple",
    doc: { labelKey: "howTriggersWork", href: "/guide/triggers/how-triggers-work" },
  },
  event_listener: {
    icon: Radio,
    brand: "emerald",
    exampleCode: "digest.ready",
    doc: { labelKey: "eventBased", href: "/guide/triggers/event-based-triggers" },
  },
  chain: {
    icon: Link,
    brand: "purple",
    doc: { labelKey: "chainGuide", href: "/guide/triggers/chain-triggers" },
  },
  composite: {
    icon: Layers,
    brand: "blue",
    doc: { labelKey: "combining", href: "/guide/triggers/combining-multiple-triggers" },
  },
  manual: {
    icon: MousePointerClick,
    brand: "cyan",
    doc: { labelKey: "howTriggersWork", href: "/guide/triggers/how-triggers-work" },
  },
};

export const TRIGGERS: TriggerDef[] = (Object.keys(TRIGGER_NODES) as TriggerKind[]).map((id) => ({ id, ...TRIGGER_NODES[id] }));

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

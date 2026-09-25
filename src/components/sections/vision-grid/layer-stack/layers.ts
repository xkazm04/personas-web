import { Cpu, FlaskConical, KeyRound, LayoutGrid, Activity, Workflow, type LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";
import type { GuideTopicRef } from "@/lib/guide-link";
import type { Translations } from "@/i18n/en";
import { PLATFORM_CARDS, type PlatformCard, type PlatformCardId } from "../data";

/**
 * Layer-stack variant data. The six layers are the six platform cards from
 * `data.ts` (brand and guide link come from there); this file adds only what
 * the stack needs to tell: where that layer shows up on the sample persona
 * card above the stack. Every word (title, description, details, the question
 * each layer answers about ONE agent, its one-line job, what it does for the
 * sample agent) is translated copy in `t.visionStack`, joined in by
 * `localizeStackLayers`.
 *
 * Order is top (nearest the agent) to bottom. Templates and Orchestration
 * share cyan in `data.ts`, so they are kept apart in the stack.
 */

type VisionCopy = Translations["visionStack"];

/** A part of the sample persona card that a layer is responsible for. */
export type CardPart = "trigger" | "model" | "origin" | "run" | "prompt" | "keys";

/** A platform card with its translated words. */
export interface LocalizedCard {
  id: PlatformCardId;
  title: string;
  description: string;
  guideTopics?: GuideTopicRef[];
}

export interface StackLayer {
  card: LocalizedCard;
  brand: BrandKey;
  icon: LucideIcon;
  question: string;
  job: string;
  /** What this layer is doing for the sample agent, in sample terms. */
  inAgent: string;
  part: CardPart;
  /**
   * The card's details. The copy omits the "40+ curated persona templates"
   * count, which contradicts the shipped catalogue (the hero derives the real
   * count); the stack does not repeat a count it cannot derive on the client.
   */
  details: string[];
}

const byId = (id: PlatformCardId): PlatformCard => {
  const card = PLATFORM_CARDS.find((c) => c.id === id);
  if (!card) throw new Error(`vision-grid layer-stack: no platform card "${id}"`);
  return card;
};

const spec: Array<{ id: PlatformCardId; icon: LucideIcon; part: CardPart }> = [
  { id: "orchestration", icon: Workflow, part: "trigger" },
  { id: "byom", icon: Cpu, part: "model" },
  { id: "templates", icon: LayoutGrid, part: "origin" },
  { id: "monitoring", icon: Activity, part: "run" },
  { id: "lab", icon: FlaskConical, part: "prompt" },
  { id: "credential-vault", icon: KeyRound, part: "keys" },
];

/** The stack, top to bottom, with every layer's translated words. */
export function localizeStackLayers(copy: VisionCopy): StackLayer[] {
  return spec.map(({ id, icon, part }) => {
    const card = byId(id);
    const words = copy.layers[id];
    return {
      card: {
        id,
        title: words.title,
        description: words.description,
        guideTopics: card.guideTopics?.map((ref) => ({ ...ref, label: words.guide })),
      },
      brand: card.brand,
      icon,
      question: words.question,
      job: words.job,
      inAgent: words.inAgent,
      part,
      details: words.details,
    };
  });
}

/**
 * The sample agent on top of the stack. Persona colour is a brand token; its
 * name, origin, trigger and last run are `t.visionStack.persona` copy.
 */
export const SAMPLE_PERSONA = {
  brand: "blue" as BrandKey,
  model: "Claude",
  spend: "$0.04",
  prompt: "prompt v3",
};

/** Real connectors (names, icons and brand colours from `src/data/connectors.ts`). */
export const SAMPLE_CONNECTORS = [
  { name: "gmail", label: "Gmail", icon: "gmail", color: "#EA4335" },
  { name: "slack", label: "Slack", icon: "slack", color: "#4A154B" },
  { name: "google_calendar", label: "Google Calendar", icon: "google-calendar", color: "#4285F4" },
];

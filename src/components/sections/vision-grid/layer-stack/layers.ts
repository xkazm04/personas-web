import { Cpu, FlaskConical, KeyRound, LayoutGrid, Activity, Workflow, type LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";
import { PLATFORM_CARDS, type PlatformCard } from "../data";

/**
 * Layer-stack variant data. The six layers are the six platform cards from
 * `data.ts` (title, brand, description, details, guide link all come from
 * there); this file adds only what the stack needs to tell: the question each
 * layer answers about ONE agent, its one-line job, and where that layer shows
 * up on the sample persona card above the stack.
 *
 * Order is top (nearest the agent) to bottom. Templates and Orchestration
 * share cyan in `data.ts`, so they are kept apart in the stack.
 */

/** A part of the sample persona card that a layer is responsible for. */
export type CardPart = "trigger" | "model" | "origin" | "run" | "prompt" | "keys";

export interface StackLayer {
  card: PlatformCard;
  brand: BrandKey;
  icon: LucideIcon;
  question: string;
  job: string;
  /** What this layer is doing for the sample agent, in sample terms. */
  inAgent: string;
  part: CardPart;
  /** `details` from data.ts, minus count claims that drift from the catalogue. */
  details: string[];
}

const byId = (id: string): PlatformCard => {
  const card = PLATFORM_CARDS.find((c) => c.id === id);
  if (!card) throw new Error(`vision-grid layer-stack: no platform card "${id}"`);
  return card;
};

// "40+ curated persona templates" contradicts the shipped catalogue (the hero
// derives the real count). The stack does not repeat a count it cannot derive
// on the client without shipping the whole template catalogue.
const withoutCounts = (details: string[]) => details.filter((d) => !/^\d+\+/.test(d));

const spec: Array<Omit<StackLayer, "card" | "brand" | "details"> & { id: string }> = [
  {
    id: "orchestration",
    icon: Workflow,
    question: "When does it run?",
    job: "Wakes it on a schedule, webhook, file or event",
    inAgent: "Schedule trigger: weekdays at 08:00",
    part: "trigger",
  },
  {
    id: "byom",
    icon: Cpu,
    question: "What does it think with?",
    job: "Runs it on Claude or on local Ollama",
    inAgent: "Claude, through the official CLI",
    part: "model",
  },
  {
    id: "templates",
    icon: LayoutGrid,
    question: "Where did it start?",
    job: "Starts it from a ready-made persona",
    inAgent: "Adopted from the Inbox Triage template",
    part: "origin",
  },
  {
    id: "monitoring",
    icon: Activity,
    question: "Is it working?",
    job: "Traces every run and recovers failures",
    inAgent: "Last run 2 min ago, finished healthy",
    part: "run",
  },
  {
    id: "lab",
    icon: FlaskConical,
    question: "How does it get better?",
    job: "Tests prompt variants before you keep one",
    inAgent: "Prompt v3, kept after an arena comparison",
    part: "prompt",
  },
  {
    id: "credential-vault",
    icon: KeyRound,
    question: "What can it touch?",
    job: "Its keys, encrypted on this device",
    inAgent: "Gmail, Slack and Calendar keys, stored locally",
    part: "keys",
  },
];

export const STACK_LAYERS: StackLayer[] = spec.map(({ id, ...rest }) => {
  const card = byId(id);
  return { ...rest, card, brand: card.brand, details: withoutCounts(card.details) };
});

/** The sample agent on top of the stack. Persona colour is a brand token. */
export const SAMPLE_PERSONA = {
  name: "Inbox triage",
  origin: "Inbox Triage template",
  brand: "blue" as BrandKey,
  trigger: "Weekdays 08:00",
  model: "Claude",
  lastRun: "2 min ago",
  spend: "$0.04",
  prompt: "prompt v3",
};

/** Real connectors (names, icons and brand colours from `src/data/connectors.ts`). */
export const SAMPLE_CONNECTORS = [
  { name: "gmail", label: "Gmail", icon: "gmail", color: "#EA4335" },
  { name: "slack", label: "Slack", icon: "slack", color: "#4A154B" },
  { name: "google_calendar", label: "Google Calendar", icon: "google-calendar", color: "#4285F4" },
];

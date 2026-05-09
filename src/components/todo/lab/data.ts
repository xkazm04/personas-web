import { MessageCircle, Swords, Dna, Radar } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { TabDef, ChatMsg, Round, GenomeNode } from "./types";

export const TABS: TabDef[] = [
  {
    key: "chat",
    label: "Chat",
    icon: MessageCircle,
    color: BRAND_VAR.cyan,
    blurb: "Refine your persona by talking to it",
  },
  {
    key: "arena",
    label: "Arena",
    icon: Swords,
    color: BRAND_VAR.purple,
    blurb: "Two prompts enter, one wins",
  },
  {
    key: "evolution",
    label: "Evolution",
    icon: Dna,
    color: BRAND_VAR.amber,
    blurb: "Breed better prompts across generations",
  },
  {
    key: "eval",
    label: "Eval",
    icon: Radar,
    color: BRAND_VAR.emerald,
    blurb: "Score personas across 6 dimensions",
  },
];

export const CHAT_SCRIPT: ChatMsg[] = [
  {
    role: "user",
    content:
      "The triage agent is labeling too many emails as urgent. Dial it back.",
    delay: 0,
  },
  {
    role: "assistant",
    content:
      "Got it. Looking at your last 200 runs — 31% were flagged urgent. Industry benchmark for this pattern is 8–12%. I'll tighten the urgency criteria.",
    delay: 900,
  },
  {
    role: "diff",
    content:
      "urgency.threshold: 0.55 → 0.78\nurgency.criteria: +\"requires_action_within_24h\"",
    delay: 700,
  },
  {
    role: "user",
    content:
      "Also stop flagging newsletters even if they say 'urgent' in the subject.",
    delay: 1800,
  },
  {
    role: "assistant",
    content:
      "Added a newsletter pre-filter. Anything with List-Unsubscribe headers or sender in marketing-domains list is now excluded from urgency scoring.",
    delay: 900,
  },
  {
    role: "diff",
    content:
      "filters.exclude_newsletters: true\n+ sender_domain_allowlist_override: false",
    delay: 700,
  },
  {
    role: "assistant",
    content:
      "Replaying the last 48h against the new config… 9.2% flagged urgent. Want me to promote this?",
    delay: 1100,
  },
];

export const ARENA_ROUNDS: Round[] = [
  {
    id: 1,
    input: "Urgent bug in prod — draft status update",
    winner: "A",
    scoreA: 92,
    scoreB: 78,
  },
  {
    id: 2,
    input: "Politely decline a meeting",
    winner: "B",
    scoreA: 81,
    scoreB: 88,
  },
  {
    id: 3,
    input: "Summarize 40 unread Slack msgs",
    winner: "A",
    scoreA: 94,
    scoreB: 86,
  },
  {
    id: 4,
    input: "Explain the PR in plain English",
    winner: "B",
    scoreA: 79,
    scoreB: 91,
  },
  {
    id: 5,
    input: "Reply to a flaky test notification",
    winner: "A",
    scoreA: 95,
    scoreB: 82,
  },
];

export const GENOME_NODES: GenomeNode[] = [
  { id: "g0", gen: 0, x: 0.5, fitness: 62, parent: null, alive: true, best: false },
  { id: "g1a", gen: 1, x: 0.3, fitness: 68, parent: "g0", alive: true, best: false },
  { id: "g1b", gen: 1, x: 0.7, fitness: 65, parent: "g0", alive: false, best: false },
  { id: "g2a", gen: 2, x: 0.25, fitness: 74, parent: "g1a", alive: true, best: false },
  { id: "g2b", gen: 2, x: 0.4, fitness: 71, parent: "g1a", alive: false, best: false },
  { id: "g3a", gen: 3, x: 0.22, fitness: 82, parent: "g2a", alive: true, best: false },
  { id: "g3b", gen: 3, x: 0.35, fitness: 79, parent: "g2a", alive: true, best: false },
  { id: "g4a", gen: 4, x: 0.22, fitness: 88, parent: "g3a", alive: true, best: false },
  { id: "g4b", gen: 4, x: 0.36, fitness: 85, parent: "g3b", alive: true, best: false },
  { id: "g5a", gen: 5, x: 0.28, fitness: 94, parent: "g4a", alive: true, best: true },
];

export const EVAL_DIMENSIONS = [
  { label: "Accuracy", score: 94, baseline: 82 },
  { label: "Clarity", score: 88, baseline: 76 },
  { label: "Tone", score: 91, baseline: 84 },
  { label: "Latency", score: 78, baseline: 72 },
  { label: "Cost", score: 85, baseline: 70 },
  { label: "Safety", score: 96, baseline: 89 },
];

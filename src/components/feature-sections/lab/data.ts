import { MessageCircle, Swords, Dna, Radar } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { TabDef, ChatMsg, Round, GenomeNode, EvalDimensionKey } from "./types";

export const TABS: TabDef[] = [
  { key: "chat", icon: MessageCircle, color: BRAND_VAR.cyan },
  { key: "arena", icon: Swords, color: BRAND_VAR.purple },
  { key: "evolution", icon: Dna, color: BRAND_VAR.amber },
  { key: "eval", icon: Radar, color: BRAND_VAR.emerald },
];

export const CHAT_SCRIPT: ChatMsg[] = [
  { role: "user", message: "tooManyUrgent", delay: 0 },
  { role: "assistant", message: "tighten", delay: 900 },
  {
    role: "diff",
    content:
      "urgency.threshold: 0.55 → 0.78\nurgency.criteria: +\"requires_action_within_24h\"",
    delay: 700,
  },
  { role: "user", message: "newsletters", delay: 1800 },
  { role: "assistant", message: "preFilter", delay: 900 },
  {
    role: "diff",
    content:
      "filters.exclude_newsletters: true\n+ sender_domain_allowlist_override: false",
    delay: 700,
  },
  { role: "assistant", message: "replayResult", delay: 1100 },
];

export const ARENA_ROUNDS: Round[] = [
  { id: 1, input: "prodBug", winner: "A", scoreA: 92, scoreB: 78 },
  { id: 2, input: "declineMeeting", winner: "B", scoreA: 81, scoreB: 88 },
  { id: 3, input: "slackSummary", winner: "A", scoreA: 94, scoreB: 86 },
  { id: 4, input: "explainPr", winner: "B", scoreA: 79, scoreB: 91 },
  { id: 5, input: "flakyTest", winner: "A", scoreA: 95, scoreB: 82 },
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

export const EVAL_DIMENSIONS: { key: EvalDimensionKey; score: number; baseline: number }[] = [
  { key: "accuracy", score: 94, baseline: 82 },
  { key: "clarity", score: 88, baseline: 76 },
  { key: "tone", score: 91, baseline: 84 },
  { key: "latency", score: 78, baseline: 72 },
  { key: "cost", score: 85, baseline: 70 },
  { key: "safety", score: 96, baseline: 89 },
];

/** The eval footer's sample size. */
export const EVAL_SAMPLE_RUNS = 50;

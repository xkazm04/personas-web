import { MessageCircle, Swords, Dna, Radar } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { TabDef, ChatMsg, Round, GenomeNode } from "./types";
import { arenaRounds, evalDimensions, genomeNodes, LEDGER_NODE, EVAL_BASELINE_NODE } from "./experiment";

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

/** Arena, eval and genome are projections of the one experiment matrix (experiment.ts). */
export const ARENA_ROUNDS: Round[] = arenaRounds(LEDGER_NODE["v4.2"], LEDGER_NODE["v4.3"]);

export const GENOME_NODES: GenomeNode[] = genomeNodes();

/** The eval radar: the live version (v4.2) against the pre-refinement baseline version. */
export const EVAL_DIMENSIONS = evalDimensions(LEDGER_NODE["v4.2"], EVAL_BASELINE_NODE);

/** The eval footer's sample size. */
export const EVAL_SAMPLE_RUNS = 50;

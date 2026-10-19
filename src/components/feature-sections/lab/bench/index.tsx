"use client";

import type { BenchProps } from "./types";
import ChatBench from "./chat/ChatBench";
import ArenaBench from "./arena/ArenaBench";
import EvolutionBench from "./evolution/EvolutionBench";
import EvalBench from "./eval/EvalBench";

/**
 * The Lab bench: every Lab tab is a readout on one bench instrument. CH1
 * tunes a signal (Chat), CH2 overlays two channels (Arena), CH3 records a
 * fitness strip chart (Evolution) and CH4 is a meter bank (Eval). Each
 * channel shares the bezel and screen parts in parts/. All figures project
 * from the ledger and the experiment matrix; nothing is retyped here.
 */
export default function Bench({ active, ledger, dispatch }: BenchProps) {
  if (active === "chat") return <ChatBench ledger={ledger} dispatch={dispatch} />;
  if (active === "arena") return <ArenaBench ledger={ledger} />;
  if (active === "evolution") return <EvolutionBench ledger={ledger} />;
  return <EvalBench ledger={ledger} />;
}

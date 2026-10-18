"use client";

import type { LabVariantProps } from "../types";
import ChatBench from "./chat/ChatBench";
import ArenaBench from "./arena/ArenaBench";
import EvolutionBench from "./evolution/EvolutionBench";
import EvalBench from "./eval/EvalBench";

/**
 * PROTOTYPE (2026-10-18) - the INSTRUMENT direction: every Lab tab is a
 * readout on one bench instrument. CH1 tunes a signal (Chat), CH2 overlays
 * two channels (Arena), CH3 records a fitness strip chart (Evolution) and
 * CH4 is a meter bank (Eval). All figures project from the ledger and the
 * experiment matrix; nothing is retyped here.
 */
export default function InstrumentVariant({ active, ledger, dispatch }: LabVariantProps) {
  if (active === "chat") return <ChatBench ledger={ledger} dispatch={dispatch} />;
  if (active === "arena") return <ArenaBench ledger={ledger} />;
  if (active === "evolution") return <EvolutionBench ledger={ledger} />;
  return <EvalBench ledger={ledger} />;
}

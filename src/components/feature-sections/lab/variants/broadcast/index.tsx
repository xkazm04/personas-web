"use client";

import type { LabVariantProps } from "../types";
import ChatHuddle from "./chat/ChatHuddle";
import ArenaMatch from "./arena/ArenaMatch";
import SeasonBracket from "./evolution/SeasonBracket";
import PlayerCard from "./eval/PlayerCard";

/**
 * PROTOTYPE variant BROADCAST: the Lab as live match coverage. Every tab is
 * one broadcast package (LIVE bug, segment plate, picture, lower ticker) over
 * the same ledger and experiment projections the baseline reads:
 * - chat: a coach's huddle - called plays, the analyst's read, the diff on the telestrator;
 * - arena: the head-to-head - scorebug, rounds, momentum strip, instant replay;
 * - evolution: the season bracket - generations enter, the culled are struck, a champion is crowned;
 * - eval: the post-match player card - overall, tier, hex chart, attribute bars, league ranks.
 */
export default function BroadcastVariant({ active, ledger, dispatch }: LabVariantProps) {
  if (active === "chat") return <ChatHuddle ledger={ledger} dispatch={dispatch} />;
  if (active === "arena") return <ArenaMatch ledger={ledger} />;
  if (active === "evolution") return <SeasonBracket ledger={ledger} />;
  return <PlayerCard ledger={ledger} />;
}

"use client";

import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { fillTemplate } from "@/lib/fillTemplate";
import { arenaContenders } from "../../../ledger";
import type { LabVariantProps } from "../../types";
import { BroadcastFrame, OnAirButton, Ticker } from "../Frame";
import { useOnAir } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { ARENA_STEPS, FINAL, ROUND_STEPS, ROUNDS, WINNER, arenaMs, resultsShown, roundAt } from "./match";
import Scorebug from "./Scorebug";
import Matchup from "./Matchup";
import Momentum from "./Momentum";
import Replay from "./Replay";

/**
 * The arena as live match coverage: a scorebug with the ledger's contenders,
 * the round on air, a momentum strip filling round by round, and - once the
 * match is final - the instant replay of the round that decided it. The match
 * plays once; after the final whistle any round can be re-cued.
 */
export default function ArenaMatch({ ledger }: Pick<LabVariantProps, "ledger">) {
  const c = broadcastCopy.arena;
  const ref = useRef<HTMLDivElement>(null);
  const air = useOnAir(ref, ARENA_STEPS, arenaMs);
  const [pick, setPick] = useState<{ round: number; run: number } | null>(null);
  const contenders = arenaContenders(ledger);

  const shown = resultsShown(air.at);
  const final = air.at >= ROUND_STEPS;
  const review = air.done && pick && pick.run === air.run ? pick.round : null;
  const round = review ?? roundAt(air.at);
  const result = final || air.at % 2 === 1;
  const r = ROUNDS[round];
  const loser = WINNER === "A" ? "B" : "A";

  const ticker = final
    ? fillTemplate(c.tickerFinal, { version: contenders[WINNER], a: FINAL[WINNER], b: FINAL[loser] })
    : result
      ? fillTemplate(c.tickerResult, {
          version: contenders[r.winner],
          n: r.id,
          a: Math.max(r.scoreA, r.scoreB),
          b: Math.min(r.scoreA, r.scoreB),
        })
      : fillTemplate(c.tickerMatchup, { n: r.id });

  return (
    <BroadcastFrame
      rootRef={ref}
      tone="purple"
      segment={broadcastCopy.segments.arena}
      live={air.live}
      moving={air.moving}
      footer={
        <Ticker label={c.ticker} tone="purple" text={ticker} moving={air.moving}>
          <OnAirButton tone="purple" onClick={air.replay} disabled={air.ticking}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {c.replayMatch}
          </OnAirButton>
        </Ticker>
      }
    >
      <div className="flex h-full flex-col">
        <Scorebug contenders={contenders} ledger={ledger} shown={shown} round={round} final={final} moving={air.moving} />
        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="min-h-[13rem] stage:min-h-0">
            {air.done && review === null ? (
              <Replay key={`replay-${air.run}`} contenders={contenders} moving={air.moving} />
            ) : (
              <Matchup round={round} result={result} review={review !== null} contenders={contenders} moving={air.moving} />
            )}
          </div>
          <Momentum
            shown={shown}
            current={air.done ? review : round}
            done={air.done}
            onPick={(i) => setPick(review === i ? null : { round: i, run: air.run })}
            moving={air.moving}
          />
        </div>
      </div>
    </BroadcastFrame>
  );
}

"use client";

import { Hourglass, Play, RotateCw, UserRound } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import HealingShell, { useOncePlay } from "./HealingCircuit.shell";
import { AttemptBar, Cross, Gap, HandOff, Lane, MovingWall, Outcome, RetryBar, Wall } from "./HealingCircuit.remedies.parts";

/*
 * /illustrate r3 variant "remedies" (mechanism): four failed runs, one lane each,
 * and the fix Personas applies to each (core/src/healing.rs `diagnose`):
 *   rate limit 429      -> wait (backoff, 30s base) and retry
 *   timed out           -> retry with the time limit doubled
 *   API server error    -> resume the session later (10, 20, 30 min)
 *   credential rejected -> no retry: a health issue for you
 * Up to 3 retries per run (MAX_RETRY_COUNT). Lanes share no time scale, so no axis.
 *
 * Beats on p (0 -> 1), each lane offset by 0.03:
 *   0.00-0.20 attempt bars grow · 0.20-0.27 crosses · 0.30-0.52 the fix
 *   0.55-0.80 retry bars grow (lane 4: the chip lands) · 0.82-0.92 outcomes
 */

const WORDS = {
  heading: "Fixes itself when things",
  headingGradient: "break",
  lede: "When a run fails, Personas reads the error and applies the matching fix, up to three retries. What a retry can't fix, like a rejected credential, comes to you as a health issue.",
  artLabel:
    "Four failed runs: a rate limit waits 30 seconds and retries, a timeout retries with its limit doubled from 5 to 10 minutes, an API server error resumes the session in 10 minutes, and a rejected credential goes to you as a health issue.",
  replay: "Replay the animation",
  rateLimit: "Rate limit",
  timedOut: "Timed out",
  serverError: "API server error",
  credential: "Credential rejected",
  wait: "wait 30s",
  limit1: "5 min",
  limit2: "10 min",
  resume: "resume in 10 min",
  healthIssue: "Health issue",
  autoFixed: "auto-fixed",
  forYou: "for you",
  keyRetries: "Up to 3 retries",
  keyThen: "then a health issue",
} as const;

const DURATION = 4.2;

export default function HealingCircuitRemedies() {
  const { ref, p, replay, still } = useOncePlay(DURATION);
  const w = WORDS;
  return (
    <HealingShell words={w} emTall={21} maxEm={50} artRef={ref} onReplay={replay} still={still}>
      <div className="flex flex-col gap-[0.7em]">
        <Lane name={w.rateLimit} code="429" outcome={<Outcome p={p} d={0} text={w.autoFixed} />}>
          <AttemptBar p={p} d={0} from={0} to={22} />
          <Cross p={p} d={0} at={22} />
          <Gap p={p} d={0} from={25} to={45} tone="amber" icon={Hourglass} label={w.wait} />
          <RetryBar p={p} d={0} from={48} to={90} />
        </Lane>

        <Lane name={w.timedOut} outcome={<Outcome p={p} d={0.03} text={w.autoFixed} />}>
          <Wall at={30} tone="rose" label={w.limit1} />
          <MovingWall p={p} d={0.03} from={30} to={94} label={w.limit2} />
          <AttemptBar p={p} d={0.03} from={0} to={30} />
          <Cross p={p} d={0.03} at={30} />
          <RetryBar p={p} d={0.03} from={34} to={80} />
        </Lane>

        <Lane name={w.serverError} code="529" outcome={<Outcome p={p} d={0.06} text={w.autoFixed} />}>
          <AttemptBar p={p} d={0.06} from={0} to={40} />
          <Cross p={p} d={0.06} at={40} />
          <Gap p={p} d={0.06} from={43} to={66} tone="amber" icon={Play} label={w.resume} />
          <RetryBar p={p} d={0.06} from={69} to={90} resumed />
        </Lane>

        <Lane
          name={w.credential}
          code="401"
          outcome={<Outcome p={p} d={0.09} text={w.forYou} person />}
        >
          <AttemptBar p={p} d={0.09} from={0} to={18} />
          <Cross p={p} d={0.09} at={18} />
          <HandOff p={p} d={0.09} from={21} to={62} label={w.healthIssue} />
        </Lane>
      </div>

      <div className="mt-[1em] flex flex-wrap items-center justify-center gap-x-[1.6em] gap-y-1 border-t border-glass pt-[0.8em] text-[0.8em] text-foreground/70">
        <span className="inline-flex items-center gap-[0.4em]">
          <RotateCw className="h-[1.1em] w-[1.1em]" style={{ color: BRAND_VAR.amber }} aria-hidden />
          {w.keyRetries}
        </span>
        <span className="inline-flex items-center gap-[0.4em]">
          <UserRound className="h-[1.1em] w-[1.1em]" style={{ color: BRAND_VAR.rose }} aria-hidden />
          {w.keyThen}
        </span>
      </div>
    </HealingShell>
  );
}

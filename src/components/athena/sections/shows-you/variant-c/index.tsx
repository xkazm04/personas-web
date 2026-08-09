"use client";

// PROTOTYPE COPY — extract to src/i18n at assembly
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM, HEADLINE } from "@/components/athena/stage/athena-tokens";
import JourneyPanel from "./JourneyPanel";
import ThreadLayer from "./ThreadLayer";
import {
  COPY,
  CYCLE,
  DESKTOP_FRACTIONS,
  DESKTOP_POINTS,
  MOBILE_FRACTIONS,
  MOBILE_POINTS,
  PANELS,
  orbLockedAt,
  orbTargetAt,
  panelStateAt,
  progressAt,
  statusLineAt,
} from "./threadData";

/*
 * Section 3, variant C — "The Thread" (the benefit: she shows you how).
 *
 * A full-viewport wide shot: the product's five key screens laid out as
 * miniature panels, and Athena's walkthrough drawn as one continuous
 * luminous thread that draws itself screen to screen. Arrival lifts the
 * panel, locks four corner brackets on the exact control, and drops a
 * ≤5-word caption; passed screens keep a checked tick and stay lit —
 * nothing is ever dimmed below readable, nothing blocked. The loop ends
 * on a pulsing "Run it" control, then the thread retracts and redraws.
 *
 * DevToolsGrid baseline: deterministic tick clock, choreography as data
 * (threadData.ts), all scene state derived purely from phase. Reduced
 * motion pins INITIAL_TICK — mid-journey at step 3, brackets locked,
 * every visited caption visible — the whole story in one image.
 *
 * Wrapped in AthenaStage for standalone preview; the wrapper unwraps at
 * assembly (the /athena page owns one stage for all sections).
 */

const TICK_MS = 900;
// Reduced-motion static frame: step 3 of 5 — thread drawn through
// Connections, brackets locked, steps 1–2 checked with captions.
const INITIAL_TICK = 12;

export default function ShowsYouThread() {
  const reduced = useReducedMotion() ?? false;
  const [tick, setTick] = useState(INITIAL_TICK);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const phase = tick % CYCLE;
  const states = PANELS.map((_, i) => panelStateAt(i, phase));
  const locked = orbLockedAt(phase);

  return (
    <AthenaStage>
      <section className="flex min-h-dvh flex-col">
        {/* Title band — the section's only prose, owned top-left corner */}
        <div className="px-6 pt-10 sm:px-10 sm:pt-14">
          <p className={ANNOTATION_DIM}>{COPY.eyebrow}</p>
          <h2 className={`mt-3 ${HEADLINE}`}>{COPY.headline}</h2>
        </div>

        {/* The wide shot — panels + thread fill the rest of the viewport */}
        <div className="relative min-h-[70vh] flex-1">
          <ThreadLayer
            points={DESKTOP_POINTS}
            progress={progressAt(phase, DESKTOP_FRACTIONS)}
            orb={orbTargetAt(phase, DESKTOP_POINTS)}
            locked={locked}
            reduced={reduced}
            className="hidden md:block"
          />
          <ThreadLayer
            points={MOBILE_POINTS}
            progress={progressAt(phase, MOBILE_FRACTIONS)}
            orb={orbTargetAt(phase, MOBILE_POINTS)}
            locked={locked}
            reduced={reduced}
            className="md:hidden"
          />
          {PANELS.map((def, i) => (
            <JourneyPanel key={def.id} def={def} state={states[i]} reduced={reduced} />
          ))}
        </div>

        {/* Mono status line — console voice, bottom band */}
        <div className="flex items-center justify-between gap-3 border-t border-glass px-6 py-4 font-mono text-sm uppercase tracking-widest text-foreground/60 sm:px-10">
          <span>{statusLineAt(phase)}</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-brand-cyan ${reduced ? "" : "animate-pulse"}`}
              aria-hidden="true"
            />
            {COPY.autonomousTag}
          </span>
        </div>
      </section>
    </AthenaStage>
  );
}

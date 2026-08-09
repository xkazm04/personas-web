"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM, HEADLINE } from "@/components/athena/stage/athena-tokens";
import { AppWindow, CanvasScene } from "./AppChrome";
import { GuideOrb, LockBrackets, ProgressRail } from "./GlideParts";
import {
  COPY,
  CYCLE,
  INITIAL_TICK,
  TICK_MS,
  actionPulseAt,
  lockedStopAt,
  orbAt,
  railAt,
  statusAt,
} from "./data";

/**
 * Section 3, variant A — "The Glide" (she shows you how).
 *
 * A full-viewport stylized desktop app plays a complete guided walkthrough
 * on the deterministic tick clock (DevToolsGrid pattern): Athena's orb
 * glides stop to stop along a scripted 4-stop route — pick a template,
 * connect Slack, set the trigger, land on the real "Create agent" button —
 * corner brackets lock onto each control, the control glows (the rest of
 * the UI is never dimmed or blocked), a ≤5-word caption narrates, and the
 * segmented rail at the bottom advances. Loop.
 *
 * The only copy outside the illustration is the section title band; every
 * other word is an in-scene UI label, caption, or the mono status line.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, a
 * mid-walkthrough frame (brackets locked on stop 2, rail 2/4, caption up).
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page
 * owns one shared stage and sections inherit it.
 */
export default function ShowsYouGlide() {
  const reduced = useReducedMotion() ?? false;
  const [tick, setTick] = useState(INITIAL_TICK);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const phase = tick % CYCLE;
  const locked = lockedStopAt(phase);
  const orb = orbAt(phase);
  const rail = railAt(phase);
  const pulse = actionPulseAt(phase);

  return (
    <AthenaStage>
      <section className="relative flex min-h-dvh flex-col px-3 pb-4 pt-8 sm:px-6 sm:pb-6 sm:pt-10">
        {/* Title band — the only words outside the illustration */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 sm:mb-7">
          <h2 className={HEADLINE}>{COPY.title}</h2>
          <p className={`hidden pb-1.5 sm:block ${ANNOTATION_DIM}`}>{COPY.eyebrow}</p>
        </div>

        {/* The illustration — a full-height app the walkthrough plays inside */}
        <AppWindow
          footer={
            <>
              <ProgressRail rail={rail} reduced={reduced} />
              <span className="shrink-0 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted-dark sm:text-sm">
                {statusAt(phase)}
              </span>
            </>
          }
        >
          <CanvasScene lockedId={locked?.id ?? null} pulse={pulse} reduced={reduced} />
          {locked && <LockBrackets key={locked.id} rect={locked.rect} reduced={reduced} />}
          <GuideOrb
            x={orb.x}
            y={orb.y}
            caption={locked?.caption ?? null}
            locked={locked !== null}
            reduced={reduced}
          />
        </AppWindow>
      </section>
    </AthenaStage>
  );
}

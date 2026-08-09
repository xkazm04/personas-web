"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useIsMobile } from "@/hooks/useIsMobile";
import { staggerContainer } from "@/lib/animations";
import { AppWindow } from "./AppChrome";
import { CanvasScene } from "./CanvasScene";
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
  rectFor,
  slackStateAt,
  statusAt,
  statusShortAt,
  travelingAt,
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
 * The app around her is real product UI: brand connector glyphs, template
 * cards with health strips, a connector list mid-handshake, a weekday
 * scheduler, a runs table and a monitoring deck — so a visitor recognises
 * the screen at a glance instead of reading labels in boxes.
 *
 * The only copy outside the illustration is the SectionIntro trio; every
 * other word is an in-scene UI label, caption, or the mono status line.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, a
 * mid-walkthrough frame (brackets locked on stop 2, rail 2/4, caption up,
 * all enriched modules rendered in their finished state).
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page
 * owns one shared stage and sections inherit it.
 */
export default function ShowsYouGlide() {
  const reduced = useReducedMotion() ?? false;
  const compact = useIsMobile();
  const [tick, setTick] = useState(INITIAL_TICK);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const phase = tick % CYCLE;
  const locked = lockedStopAt(phase);
  const orb = orbAt(phase, compact);
  const rail = railAt(phase);
  const pulse = actionPulseAt(phase);
  const traveling = travelingAt(phase);

  return (
    <AthenaStage>
      <section className="relative flex min-h-dvh flex-col px-3 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-14">
        {/* Landing-style title trio — SectionIntro needs a motion parent
            driving hidden→visible for its fadeUp variants */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer}
        >
          <SectionIntro
            eyebrow={COPY.intro.eyebrow}
            heading={COPY.intro.heading}
            gradient={COPY.intro.gradient}
            className="mb-6 sm:mb-8"
          />
        </motion.div>

        {/* The illustration — a full-height app the walkthrough plays inside */}
        <AppWindow
          footer={
            <>
              <ProgressRail rail={rail} reduced={reduced} />
              <span className={`hidden shrink-0 whitespace-nowrap sm:block ${ANNOTATION_DIM}`}>
                {statusAt(phase)}
              </span>
              <span className={`shrink-0 whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>
                {statusShortAt(phase)}
              </span>
            </>
          }
        >
          <CanvasScene
            lockedId={locked?.id ?? null}
            pulse={pulse}
            slackState={slackStateAt(phase)}
            compact={compact}
            reduced={reduced}
          />
          {locked && (
            <LockBrackets key={locked.id} rect={rectFor(locked, compact)} reduced={reduced} />
          )}
          <GuideOrb
            x={orb.x}
            y={orb.y}
            caption={locked?.caption ?? null}
            locked={locked !== null}
            traveling={traveling}
            reduced={reduced}
          />
        </AppWindow>
      </section>
    </AthenaStage>
  );
}

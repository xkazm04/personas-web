"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useStillMotion } from "@/components/athena/stage/useStillMotion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import { staggerContainer } from "@/lib/animations";
import { AppWindow } from "./AppChrome";
import { CanvasScene } from "./CanvasScene";
import { GuideOrb, LockBrackets, ProgressRail } from "./GlideParts";
import {
  CYCLE,
  INITIAL_TICK,
  TICK_MS,
  lockedStopAt,
  orbAt,
  railAt,
  rectFor,
  sceneStateAt,
  travelingAt,
} from "./data";
import { statusAt, statusShortAt } from "./status";

/**
 * Section 3, variant A — "The Glide" (onboarding partner).
 *
 * A full-viewport stylized desktop app is BUILT WITH you on the deterministic
 * tick clock (DevToolsGrid pattern). The canvas opens as a set of quiet ghosts
 * holding their rects, and each module then COMPOSES itself in layers that
 * interleave with her journey: the ghost solidifies into a panel while she is
 * still in flight toward it, the structure cascades in as she lands, the fine
 * texture fills on the bracket lock, and the choice commits as a small
 * choreographed moment. Athena's orb glides stop to stop along a scripted
 * 4-stop route — pick a template, connect Slack, choose when it runs, click
 * the real "Create agent" button — and every stop ends in a choice that
 * visibly commits (card selected, tool connected, schedule armed, agent
 * created). Corner brackets lock onto each control, the control glows (the
 * rest of the UI is never dimmed or blocked), a ≤5-word caption narrates, and
 * the segmented rail counts decisions made. Loop.
 *
 * The app around her is real product UI: brand connector glyphs, template
 * cards with health strips, a connector list mid-handshake, a weekday
 * scheduler, a runs table and a monitoring deck — so a visitor recognises
 * the screen at a glance instead of reading labels in boxes. The runs table
 * and the monitoring deck only exist after the agent is created, because
 * until then there is nothing to monitor.
 *
 * The only copy outside the illustration is the SectionIntro trio; every
 * other word is an in-scene UI label, caption, or the mono status line.
 *
 * The clock only runs while the section is on screen (useInView, 40% of
 * the section visible) and the route rewinds to START_TICK on every entry,
 * so nobody joins the story mid-sentence and nothing ticks off-screen.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, a late frame
 * where the whole workspace is assembled and every choice has committed.
 * It deliberately does NOT rewind: the still frame tells the whole story
 * at once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page
 * owns one shared stage and sections inherit it.
 */

/** Phase 0 — the true top of the route: the app chrome composing itself around
 *  a canvas of ghosts, orb docked off the UI, rail empty, nothing locked. The
 *  first module starts framing two ticks later, so every visitor watches the
 *  app get built from nothing — which only works because the clock rewinds on
 *  every entry. */
const START_TICK = 0;

export default function OnboardingPartnerGlide() {
  const reduced = useStillMotion();
  const compact = useIsMobile();
  const { t } = useTranslation();
  const { intro, captions, status } = t.athenaPage.onboarding;
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [tick, setTick] = useState(INITIAL_TICK);
  // Bumped on every (re-)entry so the chrome's compose replays on screen
  // rather than off it — see `boot` below.
  const [entries, setEntries] = useState(0);

  // Rewind to step 1 whenever the section (re-)enters view. Render-time
  // prev-state pattern — React 19 forbids sync setState in a useEffect body.
  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView && !reduced) {
      setTick(START_TICK);
      setEntries((n) => n + 1);
    }
  }

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced, inView]);

  // Reduced motion pins the assembled still outright rather than freezing the
  // clock, so a visitor who flips the preference mid-loop lands on the
  // finished story instead of a half-built app.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const scene = sceneStateAt(phase);
  const locked = lockedStopAt(phase);
  const orb = orbAt(phase, compact);
  const rail = railAt(phase);
  const traveling = travelingAt(phase);
  // One number that changes exactly when the window should reassemble itself:
  // at every loop top and at every re-entry. Reduced motion pins it so the
  // chrome renders finished and never replays.
  const boot = reduced ? 0 : entries * CYCLE + Math.floor(tick / CYCLE);

  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        className="relative flex min-h-dvh flex-col px-3 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-14"
      >
        {/* Landing-style title trio — SectionIntro needs a motion parent
            driving hidden→visible for its fadeUp variants */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer}
        >
          <SectionIntro
            eyebrow={intro.eyebrow}
            heading={intro.heading}
            gradient={intro.gradient}
            className="mb-6 sm:mb-8"
          />
        </motion.div>

        {/* The illustration — a full-height app that assembles as she guides */}
        <AppWindow
          boot={boot}
          reduced={reduced}
          footer={
            <>
              <ProgressRail rail={rail} reduced={reduced} />
              <span className={`hidden shrink-0 whitespace-nowrap sm:block ${ANNOTATION_DIM}`}>
                {statusAt(phase, status)}
              </span>
              <span className={`shrink-0 whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>
                {statusShortAt(phase, status)}
              </span>
            </>
          }
        >
          <CanvasScene scene={scene} compact={compact} reduced={reduced} />
          {locked && (
            <LockBrackets key={locked.id} rect={rectFor(locked, compact)} reduced={reduced} />
          )}
          <GuideOrb
            x={orb.x}
            y={orb.y}
            caption={locked ? captions[locked.id] : null}
            locked={locked !== null}
            traveling={traveling}
            reduced={reduced}
          />
        </AppWindow>
      </section>
    </AthenaStage>
  );
}

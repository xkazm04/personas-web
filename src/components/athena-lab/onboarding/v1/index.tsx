"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useStillMotion } from "@/components/athena/stage/useStillMotion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useTranslation } from "@/i18n/useTranslation";
import { staggerContainer } from "@/lib/animations";
import { AppWindow } from "./AppChrome";
import { CanvasScene } from "./CanvasScene";
import { GuideOrb, LockBrackets } from "./GlideParts";
import { ProgressRail, RouteTrace, Spotlight } from "./Journey";
import { tint } from "@/lib/brand-theme";
import { CYCLE, INITIAL_TICK, STOPS, TICK_MS, activeStopAt, lockedStopAt } from "./data";
import { orbAt, railAt, rectFor, sceneStateAt, travelingAt } from "./data";
import { statusAt, statusShortAt } from "./status";

/**
 * Athena lab, onboarding v1 — "The Glide", evolved to one stage.
 *
 * Same story as the live section (src/components/athena/sections/
 * onboarding-partner/variant-a, whose docstring tells it in full): a stylized
 * desktop app is BUILT WITH you while Athena glides stop to stop — pick a
 * template, connect Slack, choose when it runs, create the agent — and every
 * stop ends in a choice that visibly commits. Same tick clock, same layered
 * reveal (ghost → shell → body → detail → chosen), same in-view gate and
 * rewind, same reduced-motion still.
 *
 * What changed:
 *   - Fit: exactly one stage high. The two-column screen became three columns
 *     (choose · wire · payoff) so the app reads left to right in the order she
 *     travels and every row still holds a 40px line at the shortest stage.
 *     The window zooms by stage tier (WINDOW_ZOOM), so on a big monitor the
 *     app grows with the slot instead of floating small in it.
 *   - Light: a soft pool of light follows her (the part of the app she is on
 *     is the lit part), and the window catches a rim light from the stage.
 *   - Route: a light streak draws each leg as she flies it, and each stop
 *     leaves a pin that lights when its choice commits.
 *   - Type: her caption leads with a step numeral and sets the words in the
 *     reading face, so step and instruction read as two voices.
 */

/** Phase 0 — the true top of the route: the app chrome composing itself around
 *  a canvas of ghosts, orb docked off the UI, rail empty, nothing locked. The
 *  first module starts framing two ticks later, so every visitor watches the
 *  app get built from nothing — which only works because the clock rewinds on
 *  every entry. */
const START_TICK = 0;

/** Window zoom by stage tier. Not the shared `data-stage-zoom`: that scales by
 *  height alone, and on a 2560x1300 screen (stage capped at 100rem wide) its
 *  1.6 left the app ~1000px wide inside — three columns cannot hold. These
 *  tiers also ask for width, so the app never gets narrower than it is on a
 *  1440 laptop, and still grows on big monitors and shrinks on short ones. */
const WINDOW_ZOOM = [
  "[@media(min-width:64rem)_and_(max-height:43rem)]:[zoom:0.88]",
  "[@media(min-width:100rem)_and_(max-width:119.99rem)_and_(min-height:56rem)]:[zoom:1.15]",
  "[@media(min-width:120rem)_and_(min-height:56rem)_and_(max-height:67.49rem)]:[zoom:1.15]",
  "[@media(min-width:120rem)_and_(min-height:67.5rem)]:[zoom:1.3]",
].join(" ");

export default function OnboardingGlideEvolved() {
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

  // An ambient loop: it also stops while the tab is in the background.
  const hidden = usePageVisibility();
  useEffect(() => {
    if (reduced || !inView || hidden) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced, inView, hidden]);

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

  const active = activeStopAt(phase);
  // She stops talking once the agent exists, so the payoff builds in the clear.
  const closer = STOPS[STOPS.length - 1];
  const narrating = locked && !(locked === closer && phase > closer.chooseAt) ? locked : null;
  const flown = active ? STOPS.indexOf(active) + 1 : phase >= STOPS[0].revealAt ? STOPS.length : 0;

  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        data-stage="fill"
        aria-label={t.athenaLab.onboarding.label}
        className="relative flex min-h-dvh flex-col px-3 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-14 stage:min-h-0"
      >
        <div data-stage-inner className="mx-auto flex w-full min-h-0 flex-1 flex-col">
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

          {/* The slot holds the window; WINDOW_ZOOM scales it by tier */}
          <div data-stage-slot className="relative flex min-h-[36rem] flex-1 flex-col stage:min-h-0">
            <div
              className="pointer-events-none absolute inset-x-[8%] -bottom-6 h-16 rounded-full blur-3xl"
              style={{ backgroundColor: tint("cyan", 10) }}
              aria-hidden="true"
            />
            <div
              role="img"
              aria-label={t.athenaLab.onboarding.v1.aria}
              className={`relative flex h-full min-h-0 flex-1 flex-col ${WINDOW_ZOOM}`}
            >
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
                <Spotlight at={orb} reduced={reduced} />
                <RouteTrace flown={flown} committed={rail} compact={compact} reduced={reduced} />
                <CanvasScene scene={scene} compact={compact} reduced={reduced} />
                {locked && (
                  <LockBrackets key={locked.id} rect={rectFor(locked, compact)} reduced={reduced} />
                )}
                <GuideOrb
                  x={orb.x}
                  y={orb.y}
                  caption={narrating ? captions[narrating.id] : null}
                  step={locked ? STOPS.indexOf(locked) + 1 : 0}
                  side={compact ? "right" : (locked?.side ?? "right")}
                  locked={locked !== null}
                  traveling={traveling}
                  reduced={reduced}
                />
              </AppWindow>
            </div>
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}

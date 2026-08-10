"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { useStillMotion } from "@/components/athena/stage/useStillMotion";
import { SectionIntro } from "@/components/primitives";
import { useIsMobile } from "@/hooks/useIsMobile";
import { staggerContainer } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { COPY } from "./copy";
import { CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, sceneAt } from "./data";
import Field from "./Field";
import { layoutFor } from "./layout";
import { captionAt, statusAt, statusShortAt } from "./status";

/**
 * Section 5, variant A — "The Flight" (she holds your whole portfolio).
 *
 * A wide aerial field of your projects, and a camera that travels.
 *
 * The story the deterministic clock tells: the field composes from far away,
 * plot by plot, out of the dashed outlines that were holding its shape. She
 * checks all of them at once — one look crossing the whole field — and each
 * project answers with its health: most of them settle back calm, and a few
 * surface with a dimension that is not fine. Worst first. She goes to that
 * one, and the camera follows her DOWN — one long transform, altitude
 * changing, the whole becoming the particular — until the project is close
 * enough to open up: which dimension is failing, since when, and the one
 * specific thing she found, in the words a colleague would use. She opens
 * the thing that fixes it. Then the camera lifts back out, and the field
 * reads calm with that one marked handled and the two behind it still
 * waiting their turn. Loop.
 *
 * The soul of it is the camera. Altitude is a scale plus a pan on ONE world
 * group; everything that carries type rides a screen layer at the projected
 * position of what it names, so type never magnifies — the scene resolves
 * MORE detail as it descends instead of bigger detail, which is the layered
 * reveal expressed as zoom.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is a label, a five-word caption, or the
 * opened project's own copy.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins the flight mid-descent.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the bottom of
 * the descent one tick after the fix commits, where the field, the project
 * that needed you, what is wrong with it and the finding are all on screen
 * at once. It deliberately does NOT rewind.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: an empty sky and the shape of a portfolio. */
const START_TICK = 0;

export default function WholePortfolioFlight() {
  const reduced = useStillMotion();
  const compact = useIsMobile();
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [tick, setTick] = useState(PARK_TICK);

  // Rewind whenever the section (re-)enters view. Render-time prev-state
  // pattern — React 19 forbids sync setState in a useEffect body.
  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView && !reduced) setTick(START_TICK);
  }

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced, inView]);

  // Reduced motion pins the finished still outright rather than freezing the
  // clock, so a visitor who flips the preference mid-loop lands on the whole
  // story instead of a half-composed field.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const layout = layoutFor(compact);
  const scene = sceneAt(phase, layout.islands);

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
            eyebrow={COPY.intro.eyebrow}
            heading={COPY.intro.heading}
            gradient={COPY.intro.gradient}
            className="mb-6 sm:mb-8"
          />
        </motion.div>

        {/* The illustration — every project you own, and a camera that can
            reach any one of them. The floor the percent geometry is budgeted
            against (see ./layout); below it the field crowds its own type. */}
        <div className="relative min-h-[34rem] flex-1">
          <Field scene={scene} caption={captionAt(phase)} layout={layout} reduced={reduced} />
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2.5">
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={reduced ? undefined : { opacity: [1, 0.25, 1] }}
            transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
          <span className={`hidden truncate whitespace-nowrap sm:block ${ANNOTATION_DIM}`}>
            {statusAt(phase)}
          </span>
          <span className={`truncate whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>
            {statusShortAt(phase)}
          </span>
        </div>
      </section>
    </AthenaStage>
  );
}

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
 * The lasting-memory section, variant D — "The Anatomy".
 *
 * The page's other sections show Athena reaching further. This one shows her
 * getting BIGGER — not louder, not faster, just carrying more of you than she
 * did ten minutes ago — and it shows the mechanism rather than asserting it.
 *
 * Three zones, stacked in the order material moves through them, and the
 * silhouette argues before a word is read. WIDE at the top: what she is
 * working from right now, plentiful and rewritten constantly, because that
 * layer is the working surface and not the record. NARROW in the middle: her,
 * and everything has to pass through her. WIDE at the bottom: what she kept,
 * and that is the only layer that ever grows.
 *
 * In between sits the thing this section exists to make visible. When enough
 * has actually been said — not enough time passed, enough SAID; the ring
 * around her fills from talking and a quiet stretch leaves it exactly where it
 * was — she stops, on her own. The field goes dark, the surface stops
 * rewriting, her clip stops playing, and the only motion left is inward. Then
 * everything from that stretch streams down into her and a few durable things
 * come out the other side, each one arriving with the exact scrap it came from
 * lit the whole way back up. Much in, little kept. She wakes, and the shelf
 * under her is thicker than it was.
 *
 * It happens twice, hours apart, with a stretch of quiet in between where
 * nothing is said and nothing at all happens — because the gap is the product.
 * On the second pass she goes back over what she already knew and finds one
 * thing out of date: it is not removed and never could be, it keeps its slot,
 * goes quiet and says so, and its replacement lands two slots along. One
 * candidate arrives at the shelf with nothing behind it and is turned away.
 *
 * It ends with the surface churning at exactly the rate it started at, the
 * shelf at twice what it held after the first pass, and the ring filling again
 * toward the next one.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is a zone name or a five-word beat.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins halfway through a pass.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, deep inside the
 * hold, where both passes have run and the shelf is at its fullest. It
 * deliberately does NOT rewind: the still frame makes the whole argument at
 * once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: three empty outlines and nothing said yet. */
const START_TICK = 0;

export default function LastingMemoryAnatomy() {
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
  // argument instead of a half-filled shelf.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const layout = layoutFor(compact);
  const scene = sceneAt(phase);

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

        {/* The illustration — three zones and what moves between them. The
            floor the percent geometry is budgeted against (see ./layout);
            below it the shelf crowds its own type. */}
        <div className="relative min-h-[36rem] flex-1">
          <Field
            scene={scene}
            caption={captionAt(phase)}
            captionPrev={captionAt(phase - 1)}
            parity={phase % 2}
            layout={layout}
            reduced={reduced}
          />
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2.5">
          {/* The console light stops blinking once the section is holding —
              the status line is part of the frame, and the frame is still. */}
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={{ opacity: reduced || scene.holding ? 1 : [1, 0.25, 1] }}
            transition={
              reduced || scene.holding
                ? { duration: 0.6 }
                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }
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

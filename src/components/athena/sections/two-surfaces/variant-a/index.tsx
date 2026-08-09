"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import {
  ANNOTATION,
  ANNOTATION_DIM,
  REPLAY,
  SPRING_POP,
} from "@/components/athena/stage/athena-tokens";
import { COPY } from "./data";
import { TL } from "./ledger-geometry";
import NoiseSurfaces from "./NoiseSurfaces";
import Destinations from "./Destinations";
import { LedgerOverlay, MigrationList } from "./LedgerOverlay";

/**
 * Section 2 — "Two surfaces. Nothing else." Variant A, "The Migration
 * Ledger": the doctrine's own removal table, dramatized. Three noise
 * surfaces spring in obnoxious on the left, then each flies to its
 * documented destination on the right — popover → orb state glow, fleet
 * toast → orb pulse + durable chat-ledger row, failure toast → rendered
 * in place on the clicked surface — every flight traced by a leader line
 * and annotated as a changelog entry in the hero's mono voice. Closing
 * beat: the two survivors sit in negative space and the statement lands.
 *
 * NOTE: the AthenaStage wrapper is for standalone preview only — it
 * unwraps at page assembly (the page owns one stage all sections share).
 *
 * Motion replays on every re-entry (shared REPLAY); reduced motion gates
 * the `animate`/`whileInView` props so the final composed state renders —
 * surfaces already migrated, ledger annotations and landings visible.
 */
export default function TwoSurfacesMigrationLedger() {
  const reduced = useReducedMotion() ?? false;

  /** Spring pop with a slight settle-rotation; replays on re-entry. */
  const pop = (delay: number, rotate = -2) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14, scale: 0.96, rotate },
          whileInView: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay },
        };

  return (
    <AthenaStage>
      <section className="relative flex flex-col justify-center px-6 py-20 md:min-h-[90vh] md:py-24">
        {/* Typography zone — top; the headline is the closing beat */}
        <div className="mx-auto w-full max-w-3xl text-center">
          <motion.p {...pop(0.05, 2)} className={ANNOTATION}>
            {COPY.eyebrow}
          </motion.p>
          <motion.h2
            {...pop(TL.close)}
            className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            {COPY.headline}
          </motion.h2>
          <motion.p
            {...pop(TL.closeSub, 1)}
            className="mt-3 text-base text-foreground/80 sm:text-lg"
          >
            {COPY.sub}
          </motion.p>
        </div>

        {/* The migration stage — md+ schematic scene */}
        <div className="relative mx-auto mt-6 hidden aspect-[1000/560] w-full max-w-5xl md:block">
          <div aria-hidden="true">
            <NoiseSurfaces />
          </div>
          <LedgerOverlay />
          <div aria-label={COPY.survivorsAria} role="group">
            <Destinations />
          </div>
        </div>

        {/* Mobile collapse — ledger rows + a compact survivors line */}
        <MigrationList />
        <motion.p
          {...pop(0.55, -1)}
          aria-label={COPY.survivorsAria}
          className={`mx-auto mt-5 flex items-center gap-2 ${ANNOTATION_DIM} text-[10px] md:hidden`}
        >
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: BRAND_VAR.cyan }}
          />
          {COPY.orbLabel} + {COPY.chatTitle} · {COPY.survivorsStamp}
        </motion.p>

        {/* Doctrine whisper — the garnish facts, annotation voice */}
        <motion.p
          {...pop(TL.closeSub + 0.15, -1)}
          className={`mx-auto mt-8 max-w-xl text-center ${ANNOTATION_DIM} normal-case tracking-wide text-[11px]`}
        >
          {COPY.doctrineWhisper}
        </motion.p>
      </section>
    </AthenaStage>
  );
}

"use client";

import type { ReactNode, RefObject } from "react";
import { motion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useTranslation } from "@/i18n/useTranslation";
import { staggerContainer } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";

/**
 * The section frame: the page's AthenaStage, one `data-stage="fill"` section
 * (exactly one stage tall under the navbar on desktop), the SectionIntro trio
 * as the only outside copy, the line in a `data-stage-slot` size container
 * that takes all the room left under the intro, and one mono status line.
 *
 * The slot carries the art's accessible name (`role="img"`): the scene is a
 * self-playing loop, so its words are illustration, not a live region that
 * would read a sentence aloud every ten seconds.
 *
 * Below the stage (phones, tablets) the section flows and the slot keeps a
 * viewport-relative floor so the line has room to rise into a voice.
 */
export default function Shell({
  sectionRef,
  status,
  live,
  children,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  status: { full: string; short: string };
  live: boolean;
  children: ReactNode;
}) {
  const q = useTranslation().t.athenaSections.quiet;

  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        data-stage="fill"
        className="relative flex flex-col px-3 pb-6 pt-12 sm:px-6 sm:pt-14"
      >
        <div
          data-stage-inner=""
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col stage:max-w-[var(--stage-max-w)]"
        >
          {/* SectionIntro needs a motion parent driving hidden -> visible */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={staggerContainer}
          >
            <SectionIntro
              eyebrow={q.intro.eyebrow}
              heading={q.intro.heading}
              gradient={q.intro.gradient}
              className="mb-6 sm:mb-8"
            />
          </motion.div>

          <div
            data-stage-slot=""
            role="img"
            aria-label={q.aria}
            className="relative h-[58svh] min-h-[22rem] [container-type:size] stage:h-auto"
          >
            {children}
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-center gap-2.5" aria-live="off">
            <motion.span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan }}
              animate={live ? { opacity: [1, 0.25, 1] } : { opacity: 1 }}
              transition={live ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
            />
            <span className={`hidden whitespace-nowrap normal-case tracking-wide sm:block ${ANNOTATION_DIM}`}>
              {status.full}
            </span>
            <span className={`truncate whitespace-nowrap normal-case tracking-wide sm:hidden ${ANNOTATION_DIM}`}>
              {status.short}
            </span>
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}

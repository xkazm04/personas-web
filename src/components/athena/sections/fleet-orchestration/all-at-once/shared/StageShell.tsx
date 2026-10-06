"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { motion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useTranslation } from "@/i18n/useTranslation";
import { staggerContainer } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";

/**
 * The frame all three fleet-lab variants share: the page's AthenaStage, one
 * `data-stage="fill"` section (exactly one stage tall on desktop), the live
 * section's SectionIntro trio, the art slot, and the one mono status line.
 * Only the art differs between variants - which is the point of the round.
 */
export default function StageShell({
  sectionRef,
  status,
  statusShort,
  reduced,
  children,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  status: string;
  statusShort: string;
  reduced: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const intro = t.athenaPage.fleet.intro;
  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        data-stage="fill"
        className="relative flex flex-col px-4 pb-8 pt-12 sm:px-6"
      >
        {/* The art is one zoomed composition, so on a big monitor it may use
            more width than the page's text column (100rem) - otherwise a
            2560x1300 stage left a third of its height empty. Overrides the
            variable stage.css reads, on this element only. */}
        <div
          data-stage-inner=""
          className="mx-auto flex w-full flex-1 flex-col"
          style={{ "--stage-max-w": "min(100vw - 14rem, 150rem)" } as CSSProperties}
        >
          {/* SectionIntro needs a motion parent driving hidden -> visible */}
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
              className="mb-6"
            />
          </motion.div>

          {children}

          <div className="mt-3 flex shrink-0 items-center justify-center gap-2.5">
            <motion.span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan }}
              animate={reduced ? undefined : { opacity: [1, 0.25, 1] }}
              transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
            <span className={`hidden whitespace-nowrap normal-case sm:block ${ANNOTATION_DIM}`}>
              {status}
            </span>
            <span className={`whitespace-nowrap normal-case sm:hidden ${ANNOTATION_DIM}`}>
              {statusShort}
            </span>
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}

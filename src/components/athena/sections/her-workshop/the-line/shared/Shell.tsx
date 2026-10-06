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
 * The frame every workshop variant shares: its own AthenaStage, a section that
 * is exactly one stage tall on desktop (`data-stage="fill"`, styles/stage.css),
 * the SectionIntro trio (the only words outside the art), the art in the stage
 * slot, and one mono status line under it.
 *
 * The status light blinks while the scene is moving and holds still once it
 * settles - the line is part of the frame, and the frame is settling.
 */
export default function Shell({
  sectionRef,
  status,
  statusShort,
  settled,
  reduced,
  children,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  status: string;
  statusShort: string;
  settled: boolean;
  reduced: boolean;
  children: ReactNode;
}) {
  const { intro } = useTranslation().t.athenaPage.workshop;
  const still = reduced || settled;
  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        data-stage="fill"
        className="relative flex flex-col px-4 py-14 sm:px-6"
      >
        <div data-stage-inner className="mx-auto flex w-full flex-col">
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
              className="mb-8"
            />
          </motion.div>

          <div data-stage-slot className="relative">
            {children}
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-center gap-2.5">
            <motion.span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan }}
              animate={{ opacity: still ? 1 : [1, 0.25, 1] }}
              transition={
                still ? { duration: 0.6 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }
              aria-hidden="true"
            />
            <span className={`hidden whitespace-nowrap sm:block ${ANNOTATION_DIM}`} aria-live="off">
              {status}
            </span>
            <span className={`whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>{statusShort}</span>
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}

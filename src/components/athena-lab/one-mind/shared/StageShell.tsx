"use client";

import type { ReactNode, RefObject } from "react";
import { motion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useTranslation } from "@/i18n/useTranslation";
import { staggerContainer } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { TYPE_VARS } from "./type";

/**
 * The frame every "Always the same person" variant shares: the page's stage,
 * the title trio, the art slot and the one mono status line.
 *
 * On the desktop stage the section is exactly one stage tall (`data-stage=
 * "fill"`): the intro sits at the shared heading height, the art takes all the
 * room left (`data-stage-slot`, a size container the art measures itself
 * against) and the status line closes the column. Below the stage it flows
 * naturally, and the slot keeps an explicit height so the art can still size
 * itself against it.
 *
 * The status dot blinks while a scene is happening and holds still once it
 * has settled - the line is part of the frame, and the frame goes still.
 */
export default function StageShell({
  sectionRef,
  label,
  status,
  statusShort,
  settled,
  running,
  compactHeight = "h-[44rem]",
  children,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  /** The illustration's accessible name. */
  label: string;
  status: string;
  statusShort: string;
  settled: boolean;
  /** The scene clock is running (in view, tab in front, motion allowed). */
  running: boolean;
  /** Art height below the stage (phones, tablets). */
  compactHeight?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { intro } = t.athenaPage.oneMind;
  const still = !running || settled;

  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        data-stage="fill"
        className="relative flex min-h-dvh flex-col px-4 pb-5 pt-12 sm:px-6 stage:min-h-0"
      >
        <div data-stage-inner className="mx-auto flex w-full flex-1 flex-col">
          {/* SectionIntro's fadeUp variants need a motion parent driving them */}
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

          <div
            data-stage-slot
            role="img"
            aria-label={label}
            className={`relative [container-type:size] ${compactHeight} stage:h-auto`}
            style={TYPE_VARS}
          >
            {children}
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-center gap-2.5">
            <motion.span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan }}
              initial={false}
              animate={{ opacity: still ? 1 : [1, 0.25, 1] }}
              transition={
                still ? { duration: 0.6 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }
              aria-hidden="true"
            />
            <span className={`hidden whitespace-nowrap sm:block ${ANNOTATION_DIM}`}>{status}</span>
            <span className={`whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>{statusShort}</span>
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}

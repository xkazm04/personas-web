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
 * The frame every "Nothing quietly rots" lab variant sits in: its own
 * AthenaStage, one stage tall on desktop (`data-stage="fill"`), the
 * SectionIntro trio as the only outside copy, the art in a
 * `data-stage-slot` size container, and one mono status line under it.
 *
 * Below the stage (phones, tablets) the section flows naturally and the slot
 * keeps a floor (`min-h-[34rem]` by default) so the art never collapses; on
 * the stage that floor is overridden by stage.css and the slot takes exactly
 * the room left under the intro.
 *
 * The slot is a size container at every width (not only on the stage), so the
 * art can size its type with `cqh`/`cqw` everywhere.
 */
export default function Shell({
  sectionRef,
  label,
  status,
  live,
  slotClassName = "min-h-[34rem]",
  children,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  /** Accessible name of the illustration. */
  label: string;
  status: { full: string; short: string };
  live: boolean;
  slotClassName?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { intro } = t.athenaPage.portfolio;
  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        data-stage="fill"
        className="relative flex min-h-dvh flex-col px-3 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-14 stage:min-h-0"
      >
        <div data-stage-inner className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
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
            className={`relative flex-1 [container-type:size] ${slotClassName}`}
          >
            {children}
          </div>

          <div className="mt-3 flex shrink-0 items-center gap-2.5" aria-live="off">
            <motion.span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan }}
              animate={live ? { opacity: [1, 0.25, 1] } : { opacity: 1 }}
              transition={live ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
              aria-hidden="true"
            />
            <span className={`hidden truncate whitespace-nowrap sm:block ${ANNOTATION_DIM}`}>
              {status.full}
            </span>
            <span className={`truncate whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>
              {status.short}
            </span>
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}

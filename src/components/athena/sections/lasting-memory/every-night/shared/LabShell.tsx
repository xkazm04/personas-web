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
 * The frame all three memory-lab variants share: the page's AthenaStage, one
 * `data-stage="fill"` section (exactly one stage tall on desktop), the live
 * section's SectionIntro trio, an ASPECT-LOCKED art box in the stage slot, and
 * the one mono status line. Only the art differs between variants.
 *
 * The art box is the whole fit strategy. On the desktop stage it is as wide as
 * the slot allows and never taller than it (`data-stage-art` + `--art-ar`), so
 * the composition keeps one shape from 1366x657 to 2560x1300 and its type
 * (sized in `cqw`, see `./frame`) grows with it. Below the stage it takes the
 * full width at `compactAr`, a taller shape authored for phones.
 */
export default function LabShell({
  sectionRef,
  artLabel,
  ar,
  compactAr,
  arMin,
  compact,
  status,
  statusShort,
  steady,
  reduced,
  children,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  artLabel: string;
  /** Width / height of the art on wide screens and on phones. */
  ar: number;
  compactAr: number;
  /** Optional: on the desktop stage, let the art grow TALLER than `ar` (down
   *  to this width / height) when the slot has the room - for a percent-laid
   *  field that can take it. Omit to keep the shape locked. */
  arMin?: number;
  compact: boolean;
  status: string;
  statusShort: string;
  /** The console light stops blinking once the scene is holding still. */
  steady: boolean;
  reduced: boolean;
  children: ReactNode;
}) {
  const { intro } = useTranslation().t.athenaPage.memory;
  const shape = compact ? compactAr : ar;

  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        data-stage="fill"
        className="relative flex flex-col px-3 pb-6 pt-12 sm:px-6"
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
              eyebrow={intro.eyebrow}
              heading={intro.heading}
              gradient={intro.gradient}
              className="mb-6"
            />
          </motion.div>

          <div data-stage-slot="" className="relative">
            <div
              data-stage-art=""
              role="img"
              aria-label={artLabel}
              className="relative w-full"
              style={{ "--art-ar": shape } as CSSProperties}
            >
              <div
                className={`relative w-full [container-type:inline-size] ${
                  arMin && !compact ? "stage:aspect-auto stage:h-[min(calc(100cqh-4px),calc(100cqw/var(--art-min)))]" : ""
                }`}
                style={{ aspectRatio: `${shape}`, "--art-min": arMin } as CSSProperties}
              >
                {children}
              </div>
            </div>
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-center gap-2.5">
            <motion.span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan }}
              animate={{ opacity: reduced || steady ? 1 : [1, 0.25, 1] }}
              transition={
                reduced || steady
                  ? { duration: 0.6 }
                  : { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }
              aria-hidden="true"
            />
            <span className={`hidden whitespace-nowrap sm:block ${ANNOTATION_DIM}`}>
              {status}
            </span>
            <span className={`whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>
              {statusShort}
            </span>
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}

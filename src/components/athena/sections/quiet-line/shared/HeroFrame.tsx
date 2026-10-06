"use client";

import { useId, type PointerEventHandler, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Download } from "lucide-react";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import { EASE_CURVE } from "@/lib/animations";
import { BRAND_VAR, brandShadow } from "@/lib/brand-theme";
import { DOWNLOAD_PLAN, ctaHref } from "@/lib/release";

/**
 * The hero frame every "Meet Athena" variant shares, so the three directions
 * differ only in their art: AthenaStage ground, a `data-stage-hero` section
 * (a full 100svh with the navbar padded in; the h1 takes `--display-1`), the
 * intro at the top, the variant's art in the room left over, and the two calls
 * to action at the base.
 *
 * - `backdrop` paints behind everything (full-bleed abstract art);
 * - `children` fill the middle band (`flex-1`, a size container on the desktop
 *   stage, so art can size itself with `cqh`/`cqw`);
 * - `status` is the variant's one mono status line, shown instead of the
 *   "runs on your machine" whisper.
 *
 * The CTAs are real: "See her work" scrolls to the next /athena section,
 * "Download Personas" carries the build's download plan.
 */
export default function HeroFrame({
  sectionRef,
  backdrop,
  children,
  status,
  scrim = false,
  onPointerMove,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  backdrop?: ReactNode;
  children?: ReactNode;
  status?: ReactNode;
  /** Soft background-coloured pools behind the intro and the CTAs, for art that runs under them. */
  scrim?: boolean;
  onPointerMove?: PointerEventHandler<HTMLElement>;
}) {
  const reduced = useStillMotion();
  const { t } = useTranslation();
  const c = t.athenaPage.hero;
  const headingId = useId();

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, ease: EASE_CURVE, delay },
        };

  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        data-stage-hero
        aria-labelledby={headingId}
        onPointerMove={onPointerMove}
        className="relative isolate flex min-h-dvh flex-col"
      >
        {backdrop}
        <div className="relative z-10 mx-auto flex w-full min-h-0 flex-1 flex-col px-4 pb-6 pt-14 sm:px-6 stage:max-w-[min(100vw-14rem,150rem)] stage:pb-[2.6svh] stage:pt-[2.2svh]">
          <motion.div {...rise(0.05)} data-section-intro className="pointer-events-none relative z-20 shrink-0 text-center">
            {scrim && <Pool />}
            <p className={ANNOTATION_DIM}>{c.eyebrow}</p>
            <SectionHeading as="h1" id={headingId} className="mt-2 text-foreground">
              {c.headline} <GradientText className="drop-shadow-lg">{c.headlineGradient}</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-[1.2svh] max-w-3xl text-lg leading-snug text-foreground/80 sm:text-xl stage:text-[clamp(1.125rem,min(1.5vw,2.6svh),1.75rem)]">
              {c.tagline}
            </p>
          </motion.div>

          <div className="relative z-0 mt-6 flex flex-col stage:my-[1.6svh] stage:min-h-0 stage:flex-1 stage:[container-type:size]">
            {children}
          </div>

          <motion.div
            {...rise(0.3)}
            className="relative z-20 mt-6 flex shrink-0 flex-col items-center gap-3 stage:mt-0 stage:flex-row stage:justify-center stage:gap-6"
          >
            {scrim && <Pool />}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#onboarding"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-base font-semibold text-background transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
                style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 36, 30) }}
              >
                {c.ctaPrimary}
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={ctaHref(DOWNLOAD_PLAN)}
                className="inline-flex items-center gap-2 rounded-full border border-glass bg-background/60 px-7 py-3 text-base font-semibold text-foreground backdrop-blur-md transition-colors hover:border-glass-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {c.ctaSecondary}
              </a>
            </div>
            <div className={`text-center normal-case tracking-wide ${ANNOTATION_DIM}`}>{status ?? c.statWhisper}</div>
          </motion.div>
        </div>
      </section>
    </AthenaStage>
  );
}

/** A background-coloured pool of fog that text sits in when art runs underneath it. */
function Pool() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-[12%] -inset-y-[30%] -z-10 rounded-[50%]"
      style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--background) 88%, transparent), transparent)" }}
    />
  );
}

"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { Download, RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import PrimaryCTA from "@/components/PrimaryCTA";
import { SectionIntro } from "@/components/primitives";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import { DOWNLOAD_PLAN, ctaHref } from "@/lib/release";
import { trackDownloadClick } from "@/lib/analytics";
import { detectPlatformKey } from "@/components/waitlist-modal/waitlistUtils";

/*
 * Shared frame for the /illustrate r3 pricing variants: one stage-high section,
 * the claim as heading + lede, the art in the stage slot at its own size, and the
 * primary download CTA (same tracking as the current section).
 */

export const SHELL_WORDS = {
  heading: "Personas is",
  gradient: "free",
  replay: "Replay the illustration",
} as const;

/** One progress value 0..1, resting at 1 (server render, reduced motion), played once in view. */
export function usePlayOnce(duration: number): {
  ref: RefObject<HTMLDivElement | null>;
  p: MotionValue<number>;
  replay: () => void;
  still: boolean;
} {
  const still = useStillMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const p = useMotionValue(1);
  const run = useRef<AnimationPlaybackControls | null>(null);

  const replay = useCallback(() => {
    run.current?.stop();
    if (still) {
      p.set(1);
      return;
    }
    p.set(0);
    run.current = animate(p, 1, { duration, ease: "linear" });
  }, [p, still, duration]);

  useEffect(() => {
    if (inView) replay();
    return () => run.current?.stop();
  }, [inView, replay]);

  return { ref, p, replay, still };
}

export default function PricingShell({
  lede,
  artRef,
  artLabel,
  aspect,
  maxWidth,
  zoom = false,
  onReplay,
  still,
  children,
}: {
  lede: string;
  artRef: RefObject<HTMLDivElement | null>;
  artLabel: string;
  /** Width / height of the art box; the stage never draws it taller than the slot. */
  aspect?: number;
  /** The art's natural maximum width in px: it never grows past what its content needs. */
  maxWidth: number;
  /** DOM-built art: scale by the stage's height tiers instead of an aspect box. */
  zoom?: boolean;
  onReplay: () => void;
  still: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const box: CSSProperties = aspect
    ? ({ "--art-ar": aspect, maxWidth } as CSSProperties)
    : { maxWidth };
  return (
    <SectionWrapper fit="fill" aria-labelledby="compare-heading">
      <SectionIntro
        id="compare-heading"
        heading={SHELL_WORDS.heading}
        gradient={SHELL_WORDS.gradient}
        description={lede}
        descriptionMaxWidth="max-w-3xl"
      />

      <div data-stage-slot className="relative flex flex-col justify-center">
        <div
          ref={artRef}
          {...(aspect ? { "data-stage-art": "" } : { "data-stage-zoom": zoom ? "" : undefined })}
          style={box}
          className="relative mx-auto w-full"
        >
          <div data-illustrate-art role="img" aria-label={artLabel}>
            {children}
          </div>
          <button
            type="button"
            onClick={onReplay}
            disabled={still}
            aria-label={SHELL_WORDS.replay}
            className="absolute right-2 top-2 rounded-full border border-glass bg-white/[0.03] p-1.5 text-muted transition-colors hover:text-foreground disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <PrimaryCTA
          href={ctaHref(DOWNLOAD_PLAN)}
          onClick={() => trackDownloadClick(DOWNLOAD_PLAN, "pricing", detectPlatformKey())}
          icon={Download}
          label={t.compareSection.ctaLabel}
        />
      </div>
    </SectionWrapper>
  );
}

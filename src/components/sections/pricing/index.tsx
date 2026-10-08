"use client";

import type { CSSProperties } from "react";
import { Download, RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import PrimaryCTA from "@/components/PrimaryCTA";
import { SectionIntro } from "@/components/primitives";
import { useTranslation } from "@/i18n/useTranslation";
import { DOWNLOAD_PLAN, ctaHref } from "@/lib/release";
import { trackDownloadClick } from "@/lib/analytics";
import { detectPlatformKey } from "@/components/waitlist-modal/waitlistUtils";
import BillArt from "./BillArt";
import { TALL, WIDE } from "./billGeometry";
import { usePlayOnce } from "./usePlayOnce";
import { pricingSectionCopy } from "@/i18n/pending/pricingSection";

/**
 * Pricing: Personas itself is free (MIT, every feature, no account); the only
 * bill is the user's own Claude plan, paid to Anthropic. The art ("bill", the
 * owner's pick from /illustrate round 3) draws one agent run and the single
 * payment line. Anchor `#pricing` is held by page.tsx's stage wrapper, so this
 * section carries no id; `lib/landing-address.ts` finds it by its label.
 */

const DURATION = 4.2;

export default function Pricing() {
  const { t } = useTranslation();
  const w = pricingSectionCopy;
  const { ref, p, replay, still } = usePlayOnce(DURATION);
  // The art's natural size: never drawn taller than the stage slot (data-stage-art)
  // and never wider than its content needs.
  const box = { "--art-ar": WIDE.w / WIDE.h, maxWidth: 1000 } as CSSProperties;

  return (
    <SectionWrapper fit="fill" aria-labelledby="compare-heading">
      <SectionIntro
        id="compare-heading"
        heading={w.heading}
        gradient={w.headingGradient}
        description={w.lede}
        descriptionMaxWidth="max-w-3xl"
      />

      <div data-stage-slot className="relative flex flex-col justify-center">
        <div ref={ref} data-stage-art style={box} className="relative mx-auto w-full">
          <div role="img" aria-label={w.artLabel} className="rounded-2xl border border-glass bg-white/[0.02]">
            <BillArt l={WIDE} p={p} w={w} className="hidden h-auto w-full md:block" />
            <BillArt l={TALL} p={p} w={w} className="mx-auto block h-auto w-full max-w-sm md:hidden" />
          </div>
          <button
            type="button"
            onClick={replay}
            disabled={still}
            aria-label={w.replay}
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

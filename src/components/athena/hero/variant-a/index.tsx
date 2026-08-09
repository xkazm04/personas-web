"use client";

import { motion } from "framer-motion";
import { useStillMotion } from "@/components/athena/stage/useStillMotion";
import { BRAND_VAR, brandShadow } from "@/lib/brand-theme";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM, REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY } from "./data";
import OrbScene from "./OrbScene";
import { CalloutOverlay, CalloutList } from "./Callouts";

/**
 * Athena hero — variant A, "Presence" (round 2: schematic of a being).
 *
 * Cinematic and orb-first on the shared AthenaStage canvas: the real
 * avatar is the undisputed centerpiece, now surrounded by blueprint
 * annotation callouts — one visitor benefit each, wired to the orb by thin
 * leader lines that draw in with staggered springs and replay on every
 * scroll re-entry. One signature interaction: hover/tap/Enter and she
 * acknowledges you (ring pulse + "I'm listening."). Typography owns a
 * scrim band at the base that the art never fights.
 *
 * Continuous motion gates on `prefers-reduced-motion` via `animate`
 * props (markup identical); the looping <video> swaps for its poster.
 */
export default function AthenaPresenceHero() {
  const reduced = useStillMotion();

  /** Spring pop-in with a slight settle-rotation; replays on re-entry. */
  const pop = (delay: number, rotate = -2) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18, scale: 0.96, rotate },
          whileInView: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay },
        };

  return (
    <AthenaStage>
      <section className="relative flex min-h-dvh flex-col">
        {/* The schematic — orb square centered on a wider lg+ stage. The
            aspect/max-w literals must track STAGE_W × STAGE_H in
            presence-geometry.ts (Tailwind cannot read them at build time). */}
        <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-4 pt-16 sm:pt-20">
          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.94 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
                })}
            className="relative aspect-square w-full max-w-[min(88vmin,560px)] lg:aspect-[1024/640] lg:max-w-[1024px]"
          >
            <div className="absolute left-1/2 top-1/2 aspect-square h-full -translate-x-1/2 -translate-y-1/2">
              <OrbScene />
            </div>
            <CalloutOverlay />
          </motion.div>
          <CalloutList ariaLabel={COPY.calloutsAria} />
        </div>

        {/* Scrim zone — typography owns this band; the art fades into it */}
        <div className="relative z-[2] px-6 pb-12 pt-10 sm:pb-16">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <motion.p {...pop(0.05, 2)} className={ANNOTATION_DIM}>
              {COPY.eyebrow}
            </motion.p>
            {/* The site's landing title idiom: SectionHeading + GradientText.
                Composed directly rather than through SectionIntro — the hero
                keeps its mono eyebrow voice, a tagline larger than
                SectionIntro's description, and the reduced-motion-gated
                pop() choreography that SectionIntro's fadeUp variants
                (driven by a parent, ungated) would replace. */}
            <motion.div {...pop(0.14)} className="mt-4">
              <SectionHeading as="h1" className="text-foreground">
                {COPY.headline}{" "}
                <GradientText className="drop-shadow-lg">{COPY.headlineGradient}</GradientText>
              </SectionHeading>
            </motion.div>
            <motion.p {...pop(0.24, 1)} className="mt-4 text-xl text-foreground/80 sm:text-2xl">
              {COPY.tagline}
            </motion.p>
            <motion.p {...pop(0.32, -1)} className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-dark">
              {COPY.persona}
            </motion.p>

            <motion.div {...pop(0.42, 1)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#"
                className="rounded-full px-7 py-3 text-base font-semibold text-background transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 36, 30) }}
              >
                {COPY.ctaPrimary}
              </a>
              <a
                href="#"
                className="rounded-full border border-glass px-7 py-3 text-base font-semibold text-foreground transition-colors hover:border-glass-hover"
              >
                {COPY.ctaSecondary}
              </a>
            </motion.div>

            <motion.p {...pop(0.52, -1)} className={`mx-auto mt-6 max-w-xl ${ANNOTATION_DIM} normal-case tracking-wide`}>
              {COPY.statWhisper}
            </motion.p>
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}

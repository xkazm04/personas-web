"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useStillMotion } from "@/hooks/useStillMotion";
import { TALL, WIDE } from "./multi-provider/routerGeometry";
import { useTranslation } from "@/i18n/useTranslation";
import Art from "./multi-provider/RouterArt";

/* /illustrate variant "router": tasks of different weight flow through one router
 * to the matching Claude model; the locked task stays on the machine with Ollama. */

const DURATION = 3.6;
/** The heading template's product-name slots, drawn as gradient text. */
const HEADING_NAMES: Record<string, string> = { "{claude}": "Claude", "{ollama}": "Ollama" };

export default function MultiProviderAIRouter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const still = useStillMotion();
  const copy = useTranslation().t.aiModelsSection;
  // Server and first paint show the resolved end state: every task docked.
  const p = useMotionValue(1);
  const run = useRef<AnimationPlaybackControls | null>(null);

  const play = useCallback(() => {
    run.current?.stop();
    if (still) {
      p.set(1);
      return;
    }
    p.set(0);
    run.current = animate(p, 1, { duration: DURATION, ease: "linear" });
  }, [p, still]);

  useEffect(() => {
    if (inView) play();
    return () => run.current?.stop();
  }, [inView, play]);

  return (
    <SectionWrapper fit="fill" id="multi-provider">
      <div className="text-center" data-section-intro>
        <SectionHeading>
          {copy.heading.split(/(\{claude\}|\{ollama\})/).map((part, i) =>
            HEADING_NAMES[part] ? (
              <GradientText key={i} className="drop-shadow-lg">
                {HEADING_NAMES[part]}
              </GradientText>
            ) : (
              part
            ),
          )}
        </SectionHeading>
        <p data-section-lede className="mx-auto mt-4 max-w-2xl text-foreground/85 font-light md:text-lg">
          {copy.lede}
        </p>
      </div>

      <div data-stage-slot>
      <div
        ref={ref}
        data-stage-art
        // The wide router plus its frame padding (p-5): about 1040 x 480.
        style={{ "--art-ar": 1040 / 480 } as CSSProperties}
        className="relative mx-auto mt-10 max-w-5xl"
      >
        <div
          data-illustrate-art
          role="img"
          aria-label={copy.artLabel}
          className="rounded-2xl border border-glass bg-white/[0.02] p-3 md:p-5"
        >
          <Art l={WIDE} p={p} className="hidden h-auto w-full md:block" />
          <Art l={TALL} p={p} className="mx-auto block h-auto w-full max-w-sm md:hidden" />
        </div>
        <button
          type="button"
          onClick={play}
          aria-label={copy.replay}
          className="absolute right-3 top-3 rounded-lg border border-glass bg-white/[0.03] p-2 text-foreground/60 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      </div>
    </SectionWrapper>
  );
}

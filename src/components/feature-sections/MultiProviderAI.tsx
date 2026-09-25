"use client";

import { useCallback, useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useStillMotion } from "@/hooks/useStillMotion";
import { TALL, WIDE } from "./multi-provider/routerGeometry";
import Art from "./multi-provider/RouterArt";

/* /illustrate variant "router": tasks of different weight flow through one router
 * to the matching Claude model; the locked task stays on the machine with Ollama. */

const DURATION = 3.6;

export default function MultiProviderAIRouter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const still = useStillMotion();
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
    <SectionWrapper id="multi-provider">
      <div className="text-center">
        <SectionHeading>
          Powered by{" "}
          <GradientText className="drop-shadow-lg">Claude</GradientText>.
          Private via <GradientText className="drop-shadow-lg">Ollama</GradientText>.
        </SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-foreground/85 font-light">
          Two engines, one consistent agent runtime.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto mt-10 max-w-5xl">
        <div
          data-illustrate-art
          role="img"
          aria-label="Tasks of different weight pass through one router: light, default and heavy ones go to Claude Haiku, Sonnet and Opus, while a locked private task stays on your machine with Ollama."
          className="rounded-2xl border border-glass bg-white/[0.02] p-3 md:p-5"
        >
          <Art l={WIDE} p={p} className="hidden h-auto w-full md:block" />
          <Art l={TALL} p={p} className="mx-auto block h-auto w-full max-w-sm md:hidden" />
        </div>
        <button
          type="button"
          onClick={play}
          aria-label="Replay animation"
          className="absolute right-3 top-3 rounded-lg border border-glass bg-white/[0.03] p-2 text-foreground/60 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </SectionWrapper>
  );
}

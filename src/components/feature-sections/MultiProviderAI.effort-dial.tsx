"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  type AnimationPlaybackControls,
} from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useStillMotion } from "@/hooks/useStillMotion";
import { Dial, END, SECONDS_PER_BEAT } from "./MultiProviderAI.effort-dial.art";

export default function MultiProviderAIEffortDial() {
  const still = useStillMotion();
  const artRef = useRef<HTMLDivElement>(null);
  const inView = useInView(artRef, { once: true, amount: 0.4 });
  const p = useMotionValue(END);
  const controls = useRef<AnimationPlaybackControls | null>(null);

  const play = () => {
    controls.current?.stop();
    if (still) {
      p.jump(END);
      return;
    }
    p.jump(0);
    controls.current = animate(p, END, { duration: END * SECONDS_PER_BEAT, ease: "linear" });
  };

  useEffect(() => {
    controls.current?.stop();
    if (still) p.jump(END);
    else if (!inView) p.jump(0);
    else controls.current = animate(p, END, { duration: END * SECONDS_PER_BEAT, ease: "linear" });
    return () => controls.current?.stop();
  }, [still, inView, p]);

  return (
    <SectionWrapper id="multi-provider">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Powered by{" "}
            <GradientText className="drop-shadow-lg">Claude</GradientText>.
            Private via <GradientText className="drop-shadow-lg">Ollama</GradientText>.
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-foreground/85 font-light"
        >
          Claude picks the effort per task. Ollama keeps private work local.
        </motion.p>
      </motion.div>

      <div
        ref={artRef}
        data-illustrate-art
        role="group"
        aria-label="A dial sets model power per task: light tasks to Haiku, default to Sonnet, heavy to Opus; flipping offline moves the needle to one local Ollama zone."
        className="relative mx-auto mt-12 w-full max-w-4xl rounded-3xl border border-glass bg-white/[0.03] px-2 pb-5 pt-10 sm:px-10"
      >
        <Dial p={p} />
        <button
          type="button"
          onClick={play}
          aria-label="Replay the animation"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-glass bg-white/[0.04] text-foreground/60 transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </SectionWrapper>
  );
}

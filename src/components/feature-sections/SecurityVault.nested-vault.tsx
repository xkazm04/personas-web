"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue } from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useStillMotion } from "@/hooks/useStillMotion";
import NestedVaultArt from "./SecurityVault.nested-vault.art";

/**
 * /illustrate 1.1.0 variant "nested-vault": three concentric seals (device, OS
 * keychain, AES-256-GCM) turn and lock, one after another, around your keys.
 * One progress value drives every beat; it rests at 1 (the sealed end state) for
 * the server render and reduced motion, and plays 0 -> 1 once when in view.
 */
const DURATION = 3.8;

export default function SecurityVaultNestedVault() {
  const still = useStillMotion();
  const artRef = useRef<HTMLDivElement>(null);
  const inView = useInView(artRef, { once: true, amount: 0.35 });
  const progress = useMotionValue(1);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (still) {
      progress.set(1);
      return;
    }
    if (!inView) return;
    progress.set(0);
    const controls = animate(progress, 1, { duration: DURATION, ease: "linear" });
    return () => controls.stop();
  }, [inView, still, run, progress]);

  return (
    <SectionWrapper id="security">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Your data never{" "}
            <GradientText className="drop-shadow-lg">leaves</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-foreground/85 font-light text-base md:text-lg leading-relaxed"
        >
          Every credential is encrypted on your device and kept in your OS&apos;s own vault.
        </motion.p>
      </motion.div>

      <div
        ref={artRef}
        data-illustrate-art
        role="figure"
        aria-label="Three nested rings, your device, the OS keychain and AES-256-GCM encryption, turn and lock one by one around your keys at the centre."
        className="relative mx-auto mt-10 aspect-square w-full max-w-4xl overflow-hidden rounded-3xl border border-glass bg-white/[0.02] sm:aspect-[19/12]"
      >
        <NestedVaultArt progress={progress} />
        <button
          type="button"
          aria-label="Replay the animation"
          onClick={() => setRun((n) => n + 1)}
          disabled={still}
          className="absolute bottom-3 right-3 rounded-full border border-glass bg-white/[0.03] p-2 text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </SectionWrapper>
  );
}

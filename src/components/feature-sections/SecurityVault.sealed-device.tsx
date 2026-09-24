"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useStillMotion } from "@/hooks/useStillMotion";
import SealedDeviceArt from "./SecurityVault.sealed-device.art";
import { CLOUD, VIEW_H, VIEW_W } from "./SecurityVault.sealed-device.geometry";

/**
 * Security, variant "sealed-device": the device is a sealed boundary. Three keys
 * drift into locks inside the OS vault and the locks close; a dashed line tries to
 * leave for the cloud, breaks at the device edge, and the cloud greys out, struck.
 *
 * One progress value drives every beat, played once when the art comes into view
 * (and again from the replay button). The server render and reduced motion show the
 * resolved end state (p = 1), which carries the whole structure on its own.
 */

const PLAY_SECONDS = 3.6;

/** Labels placed against the 900 x 400 drawing, in percent. */
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export default function SecurityVaultSealedDevice() {
  const still = useStillMotion();
  const artRef = useRef<HTMLDivElement>(null);
  const inView = useInView(artRef, { once: true, amount: 0.35 });
  const [run, setRun] = useState(0);
  const p = useMotionValue(1);
  const cloudLabel = useTransform(p, [CLOUD.grey[0], CLOUD.grey[1]], [1, 0.4]);

  useEffect(() => {
    if (still || (!inView && run === 0)) {
      p.set(1);
      return;
    }
    const controls = animate(p, [0, 1], { duration: PLAY_SECONDS, ease: "linear" });
    return () => controls.stop();
  }, [still, inView, run, p]);

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
          Every password, API key and token is encrypted on your device.
        </motion.p>
      </motion.div>

      <div
        ref={artRef}
        data-illustrate-art
        role="figure"
        aria-label="Three keys lock into the OS vault inside your device with AES-256; a line toward the cloud breaks at the device edge, so nothing leaves."
        className="relative -mx-4 mt-10 w-[calc(100%+2rem)] max-w-5xl overflow-hidden border-y border-glass bg-white/[0.02] sm:mx-auto sm:w-full sm:rounded-3xl sm:border md:mt-14"
      >
        <div className="relative w-full" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
          <SealedDeviceArt p={p} />

          <span
            className="absolute -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] sm:text-xs"
            style={{ left: pct(390, VIEW_W), top: pct(364, VIEW_H), color: BRAND_VAR.cyan }}
          >
            Your device
          </span>
          <span
            className="absolute whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.08em] sm:text-xs sm:tracking-[0.18em]"
            style={{ left: pct(206, VIEW_W), top: pct(94, VIEW_H), color: BRAND_VAR.purple }}
          >
            OS vault
          </span>
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-px font-mono text-[10px] tracking-wider sm:text-xs"
            style={{
              left: pct(375, VIEW_W),
              top: pct(244, VIEW_H),
              color: BRAND_VAR.emerald,
              borderColor: tint("emerald", 40),
              backgroundColor: tint("emerald", 10),
            }}
          >
            AES-256
          </span>
          <motion.span
            className="absolute -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/80 sm:text-xs"
            style={{ left: pct(CLOUD.cx, VIEW_W), top: pct(CLOUD.cy + 46, VIEW_H), opacity: cloudLabel }}
          >
            Cloud
          </motion.span>

          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            disabled={still}
            aria-label="Replay the illustration"
            className="absolute right-2 top-2 rounded-full border border-glass bg-white/[0.03] p-1.5 text-foreground/60 transition-colors hover:bg-white/[0.08] hover:text-foreground disabled:hidden sm:right-3 sm:top-3 sm:p-2"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}

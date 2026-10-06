"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, LayersShell, StylisedTag, frame } from "./shared/Shell";
import Scene from "./Scene";
import Ledger from "./Ledger";
import Scrubber from "./Scrubber";
import { DESIGNED, H, HEALED, HOLD_MS, NODES, ROOT, STEP_MS, W } from "./geometry";

const f = frame(W, H);

/**
 * V2 "Growth dial" - the claim told as time: drag (or play) from day one to
 * year one and watch agents branch up out of the same laptop, one ring per
 * stop, while the ledger lights the layer each stop leans on and the count
 * climbs 1 -> 3 -> 12 -> 40. The laptop never changes. Reduced motion: the
 * year-one frame, still, every control live.
 */
export default function LayersGrowthDial() {
  const v = useTranslation().t.howSections.layers.v2;
  const boxRef = useRef<HTMLDivElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const { run, still } = useLoopGate(boxRef, { userStopped: userPaused });
  const [stage, setStage] = useState(() => (still ? 3 : 0));
  const [prevStill, setPrevStill] = useState(still);
  if (still !== prevStill) {
    setPrevStill(still);
    if (still) setStage(3);
  }
  const playing = run;

  useEffect(() => {
    if (!run) return;
    const id = setTimeout(() => setStage((s) => (s + 1) % 4), stage === 3 ? HOLD_MS : STEP_MS);
    return () => clearTimeout(id);
  }, [run, stage]);

  const choose = (s: number) => {
    setUserPaused(true);
    setStage(s);
  };
  const designed = NODES[DESIGNED];
  const healed = NODES[HEALED];
  const fade = (on: boolean, delay = 0) => ({
    initial: false as const,
    animate: { opacity: on ? 1 : 0, y: on ? 0 : 8 },
    transition: still ? { duration: 0 } : { duration: 0.5, delay: on ? delay : 0 },
  });

  return (
    <LayersShell lede={v.lede}>
      <ArtBox w={W} h={H} label={v.artLabel} boxRef={boxRef}>
        <Scene stage={stage} run={run} still={still} />

        {/* Month 3: a sentence becomes the newest agent. */}
        <motion.div
          aria-hidden
          className="absolute flex items-center rounded-2xl rounded-bl-sm border"
          style={{
            ...f.box(designed.x + 30, designed.y - 92),
            ...f.fs(17, 13),
            paddingInline: f.u(16),
            height: f.u(46),
            borderColor: tint("purple", 55),
            background: "color-mix(in srgb, var(--surface) 88%, transparent)",
            boxShadow: `0 0 24px ${tint("purple", 30)}`,
          }}
          {...fade(stage === 2, 0.7)}
        >
          <motion.span
            className="block overflow-hidden whitespace-nowrap text-foreground"
            initial={false}
            animate={{ clipPath: stage === 2 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={still ? { duration: 0 } : { duration: stage === 2 ? 1.1 : 0, delay: stage === 2 ? 0.9 : 0, ease: "linear" }}
          >
            {v.prompt}
          </motion.span>
        </motion.div>

        {/* Year 1: the one that stumbled, healed. */}
        <motion.span
          aria-hidden
          className="absolute flex items-center font-mono uppercase tracking-[0.14em]"
          style={{ ...f.box(healed.x - 20, healed.y - 58), ...f.fs(14, 12), gap: f.u(4), color: BRAND_VAR.emerald }}
          {...fade(stage === 3, 1.2)}
        >
          <Check aria-hidden style={{ width: "1.1em", height: "1.1em" }} />
          {v.healed}
        </motion.span>

        {/* The constant: the same laptop at every stop. */}
        <p
          className="absolute font-semibold text-foreground"
          style={{ ...f.box(ROOT.x + 150, ROOT.y + 60, 310), ...f.fs(20, 15), lineHeight: 1.25 }}
        >
          <span aria-hidden className="mr-2 inline-block h-[0.55em] w-[0.55em] rounded-full align-middle" style={{ background: BRAND_VAR.emerald, boxShadow: `0 0 10px ${tint("emerald", 70)}` }} />
          {v.sameLaptop}
        </p>

        <Ledger stage={stage} still={still} />
        <Scrubber
          stage={stage}
          playing={playing}
          still={still}
          onStage={choose}
          onToggle={() => {
            if (playing) setUserPaused(true);
            else {
              setUserPaused(false);
              if (stage === 3) setStage(0);
            }
          }}
        />
        <StylisedTag style={{ right: 0, top: 0 }} />
      </ArtBox>
    </LayersShell>
  );
}

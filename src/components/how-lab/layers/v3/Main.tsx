"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, LayersShell, StylisedTag, frame } from "../shared/Shell";
import World from "./World";
import PathBar from "./PathBar";
import { LEVEL_LAYERS } from "./levels";
import { FH, H, HOLD_MS, W, ZOOM_S } from "./geometry";

const f = frame(W, H);

/**
 * V3 "Zoom" - the claim told as scale: start on one task described in plain
 * words, then pull the camera back. The task is a card in a chain, the chain
 * one card in a fleet, the fleet one window on your own computer. Each level
 * names the layer that carries it, and the path under the lens is the way in
 * and back. Reduced motion: the outermost frame, still; the path jumps.
 */
export default function LayersZoom() {
  const { t } = useTranslation();
  const c = t.howLab.layers;
  const v = c.v3;
  const boxRef = useRef<HTMLDivElement>(null);
  const [userStopped, setUserStopped] = useState(false);
  const { run, still } = useLoopGate(boxRef, { userStopped });
  const [level, setLevel] = useState(() => (still ? 3 : 0));
  const [prevStill, setPrevStill] = useState(still);
  if (still !== prevStill) {
    setPrevStill(still);
    if (still) setLevel(3);
  }

  const cam = useMotionValue(level);
  useEffect(() => {
    if (still) {
      cam.set(level);
      return;
    }
    const d = Math.abs(cam.get() - level);
    const ctl = animate(cam, level, { duration: ZOOM_S * Math.min(Math.max(d, 0.5), 1.6), ease: [0.65, 0, 0.35, 1] });
    return () => ctl.stop();
  }, [level, still, cam]);

  useEffect(() => {
    if (!run) return;
    const id = setTimeout(() => setLevel((l) => (l + 1) % 4), HOLD_MS[level] + ZOOM_S * 1000);
    return () => clearTimeout(id);
  }, [run, level]);

  const choose = (k: number) => {
    setUserStopped(true);
    setLevel(Math.max(0, Math.min(3, k)));
  };
  const layer = LEVEL_LAYERS[level];
  const lv = v.levels[level];

  return (
    <LayersShell lede={v.lede}>
      <ArtBox w={W} h={H} label={v.artLabel} boxRef={boxRef}>
        <div
          className="absolute overflow-hidden rounded-2xl border border-glass"
          style={{
            ...f.box(0, 0, W, FH),
            background: "color-mix(in srgb, var(--surface) 55%, transparent)",
            boxShadow: `0 30px 80px -40px ${tint(layer.brand, 55)}, inset 0 0 0 1px ${tint(layer.brand, 18)}`,
            transition: "box-shadow 600ms ease",
          }}
        >
          <World cam={cam} level={level} run={run} />

          {/* The level's caption, on its own plate in the corner each frame keeps clear. */}
          <motion.div
            key={level}
            initial={still ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: still ? 0 : 0.5 }}
            aria-live="polite"
            className="absolute rounded-2xl border border-glass backdrop-blur-md"
            style={{
              left: f.u(20),
              top: f.u(18),
              width: f.u(480),
              padding: `${f.u(14)} ${f.u(20)}`,
              background: "color-mix(in srgb, var(--background) 72%, transparent)",
            }}
          >
            <p className="flex items-center font-mono font-semibold uppercase tracking-[0.16em]" style={{ ...f.fs(13, 12), gap: f.u(10), color: BRAND_VAR[layer.brand] }}>
              <span aria-hidden className="inline-block rounded-full" style={{ width: "0.7em", height: "0.7em", background: BRAND_VAR[layer.brand], boxShadow: `0 0 10px ${tint(layer.brand, 70)}` }} />
              {c.names[layer.id]}
            </p>
            <p className="font-semibold leading-tight tracking-tight text-foreground" style={{ ...f.fs(34, 20), marginTop: f.u(4) }}>
              {lv.name}
            </p>
            <p className="leading-snug text-muted" style={{ ...f.fs(18, 16), marginTop: f.u(6) }}>
              {lv.line}
            </p>
          </motion.div>
          <StylisedTag style={{ right: f.u(18), bottom: f.u(12) }} />
        </div>
        <PathBar level={level} onLevel={choose} />
      </ArtBox>
    </LayersShell>
  );
}

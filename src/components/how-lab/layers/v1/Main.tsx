"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, LayersShell, StylisedTag, frame } from "../shared/Shell";
import { LAYERS } from "../shared/layers";
import Slab, { type SlabMode } from "./Slab";
import Rail from "./Rail";
import { RunArt, CoordinateArt, type ArtProps } from "./artsLow";
import { DesignArt, MonitorArt } from "./artsHigh";
import { BEAT_MS, CHIP, H, SLAB_H, SLAB_X, SPINE_X, W, slabTop } from "./geometry";

const f = frame(W, H);
const EASE = [0.22, 1, 0.36, 1] as const;
/** `focus` value meaning "the whole stack is lit". */
const ALL = 4;
type AnyArt = (p: ArtProps & { prompt: string; healed: string; noServers: string }) => React.ReactNode;
const ARTS: AnyArt[] = [RunArt, CoordinateArt, DesignArt, MonitorArt];

/**
 * V1 "Lit stack" - the live section's concept, rebuilt: four glass layers
 * pressed together fan out as the section scrolls in (and once on arrival),
 * then one request rises through them bottom to top, lighting each layer as
 * it passes until the whole stack glows. The rail and the slabs preview a
 * layer on hover/focus; a rail click pins it. Reduced motion: the stack is
 * spread, flat and fully lit.
 */
export default function LayersLitStack() {
  const { t } = useTranslation();
  const c = t.howLab.layers;
  const v = c.v1;
  const boxRef = useRef<HTMLDivElement>(null);
  const { run, still } = useLoopGate(boxRef);

  const [pinned, setPinned] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [beat, setBeat] = useState(0);
  const chosen = preview ?? pinned;
  const cycling = run && chosen === null;
  const focus = chosen ?? (still ? ALL : beat);

  // Spread: scroll-linked like the live section, and also played once on arrival.
  const { scrollYProgress } = useScroll({ target: boxRef, offset: ["start end", "start 0.6"] });
  const scrollSpread = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const enter = useMotionValue(0);
  const flat = useMotionValue(0);
  const spread = useTransform(() => (flat.get() ? 1 : Math.min(scrollSpread.get(), enter.get())));
  const inView = useInView(boxRef, { once: true, amount: 0.25 });

  useEffect(() => {
    flat.set(still ? 1 : 0);
  }, [still, flat]);

  useEffect(() => {
    if (!inView) return;
    const ctl = animate(enter, 1, { duration: 1.5, ease: EASE, delay: 0.2 });
    return () => ctl.stop();
  }, [inView, enter]);

  useEffect(() => {
    if (!cycling) return;
    const id = setInterval(() => setBeat((b) => (b + 1) % (ALL + 1)), BEAT_MS);
    return () => clearInterval(id);
  }, [cycling]);

  // The request: a bead on the spine that climbs to the lit layer.
  const bead = useMotionValue(0);
  const target = focus === ALL ? 3 : focus;
  useEffect(() => {
    if (still || target < bead.get() - 0.5) {
      bead.set(target);
      return;
    }
    const ctl = animate(bead, target, { duration: 0.75, ease: EASE });
    return () => ctl.stop();
  }, [target, still, bead]);
  const beadTop = useTransform(() => `${((slabTop(bead.get(), spread.get()) + SLAB_H / 2) / H) * 100}%`);
  const litH = useTransform(() => `${((slabTop(0, spread.get()) - slabTop(bead.get(), spread.get())) / H) * 100}%`);
  const spineTop = useTransform(spread, (s) => `${((slabTop(3, s) + SLAB_H / 2) / H) * 100}%`);
  const spineH = useTransform(spread, (s) => `${((slabTop(0, s) - slabTop(3, s)) / H) * 100}%`);

  const mode = (i: number): SlabMode => {
    if (focus === ALL) return "on";
    if (chosen !== null) return i === focus ? "current" : "off";
    return i === beat ? "current" : i < beat ? "on" : "off";
  };
  const names = LAYERS.map((l) => c.names[l.id]);

  return (
    <LayersShell lede={v.lede}>
      <ArtBox w={W} h={H} label={v.artLabel} boxRef={boxRef}>
        <motion.div
          aria-hidden
          className="absolute w-[2px] -translate-x-1/2 rounded-full"
          style={{
            left: `${(SPINE_X / W) * 100}%`,
            top: spineTop,
            height: spineH,
            background: `linear-gradient(0deg, ${BRAND_VAR.emerald}, ${BRAND_VAR.cyan}, ${BRAND_VAR.purple}, ${BRAND_VAR.amber})`,
            opacity: 0.55,
          }}
        />
        {/* The climbed part of the spine, lit from Run up to the request. */}
        <motion.div
          aria-hidden
          className="absolute w-[3px] -translate-x-1/2 rounded-full"
          style={{
            left: `${(SPINE_X / W) * 100}%`,
            top: beadTop,
            height: litH,
            background: `linear-gradient(0deg, ${BRAND_VAR.emerald}, ${BRAND_VAR.cyan}, ${BRAND_VAR.purple})`,
            boxShadow: `0 0 12px ${tint("cyan", 55)}`,
          }}
        />
        {/* Light pooling under the stack. */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-[50%] blur-2xl"
          style={{
            left: `${(SLAB_X / W) * 100}%`,
            right: 0,
            bottom: f.u(-14),
            height: f.u(90),
            background: `radial-gradient(closest-side, ${tint("emerald", 26)}, ${tint("purple", 10)} 60%, transparent)`,
          }}
        />
        <Rail
          spread={spread}
          focus={focus}
          pinned={pinned}
          names={names}
          label={v.railLabel}
          onPreview={setPreview}
          onPin={(i) => setPinned((p) => (p === i ? null : i))}
        />
        {LAYERS.map((layer, i) => {
          const Art = ARTS[i];
          const m = mode(i);
          return (
            <Slab
              key={layer.id}
              layer={layer}
              index={i}
              spread={spread}
              mode={m}
              still={still}
              name={names[i]}
              title={v.layers[layer.id].title}
              line={v.layers[layer.id].line}
              onEnter={() => setPreview(i)}
              onLeave={() => setPreview(null)}
            >
              <Art on={m !== "off"} live={m !== "off" && run} still={still} prompt={v.prompt} healed={v.healed} noServers={v.noServers} />
            </Slab>
          );
        })}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-[1.35rem] border-2"
          style={{
            left: `${(SPINE_X / W) * 100}%`,
            top: beadTop,
            width: f.u(CHIP + 20),
            height: f.u(CHIP + 20),
            borderColor: BRAND_VAR[LAYERS[target].brand],
            boxShadow: `0 0 22px 2px ${tint(LAYERS[target].brand, 60)}, inset 0 0 12px ${tint(LAYERS[target].brand, 40)}`,
            transition: "border-color 400ms ease, box-shadow 400ms ease",
          }}
        />
        <StylisedTag style={{ left: 0, bottom: 0 }} />
      </ArtBox>
    </LayersShell>
  );
}

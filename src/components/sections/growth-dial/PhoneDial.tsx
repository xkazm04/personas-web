"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { LayersShell, StylisedTag, frame } from "./shared/Shell";
import { LAYERS } from "./shared/layers";
import { COUNTS, NARROW } from "./geometry";
import { useGrowth } from "./useGrowth";
import Scene from "./Scene";
import PhoneScrubber from "./PhoneScrubber";

const f = frame(NARROW.w, NARROW.h);
const designed = NARROW.nodes[NARROW.designed];
const healed = NARROW.nodes[NARROW.healed];

/**
 * The growth dial at phone size: the stop and its agent count as a headline,
 * the same laptop with the agents branching up out of it (a taller, narrower
 * fan), the scrubber, and the four layers lighting as each stop leans on them.
 * Same clock as the wide dial (useGrowth); reduced motion rests on year 1.
 */
export default function PhoneDial() {
  const v = useTranslation().t.howSections.layers.v2;
  const { boxRef, stage, run, still, playing, choose, toggle } = useGrowth();
  const stop = v.stops[stage];
  const count = COUNTS[stage];
  const enter = still ? false : { opacity: 0, y: 10 };
  const fade = (on: boolean, delay = 0) => ({
    initial: false as const,
    animate: { opacity: on ? 1 : 0, y: on ? 0 : 8 },
    transition: still ? { duration: 0 } : { duration: 0.5, delay: on ? delay : 0 },
  });

  return (
    <LayersShell lede={v.lede}>
      <div className="relative z-10 mx-auto flex w-full max-w-[26rem] flex-col gap-4">
        <div className="flex items-end justify-between gap-4" aria-live="polite">
          <motion.div key={`s${stage}`} initial={enter} animate={{ opacity: 1, y: 0 }} className="min-w-0">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: BRAND_VAR[LAYERS[stage].brand] }}>
              {stop.when}
            </p>
            <p className="text-2xl font-semibold leading-tight tracking-tight text-foreground">{stop.what}</p>
          </motion.div>
          <p className="flex shrink-0 items-baseline gap-2">
            <motion.span
              key={`n${stage}`}
              initial={enter}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-brand-cyan to-brand-purple bg-clip-text text-6xl font-bold leading-none tracking-tighter text-transparent tabular-nums"
            >
              {count}
            </motion.span>
            <span className="text-base text-muted">{count === 1 ? v.agent : v.agents}</span>
          </p>
        </div>

        <div ref={boxRef} role="group" aria-label={v.artLabel} className="relative w-full" style={{ aspectRatio: `${NARROW.w} / ${NARROW.h}` }}>
          <Scene g={NARROW} stage={stage} run={run} still={still} />
          {/* Month 3: a sentence becomes the newest agent. */}
          <motion.div
            aria-hidden
            className="absolute flex items-center rounded-2xl rounded-br-sm border px-3 py-1.5 text-base"
            style={{
              right: `${((NARROW.w - designed.x - 24) / NARROW.w) * 100}%`,
              top: f.box(0, 60).top,
              borderColor: tint("purple", 55),
              background: "color-mix(in srgb, var(--surface) 88%, transparent)",
              boxShadow: `0 0 20px ${tint("purple", 30)}`,
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
            className="absolute flex items-center gap-1 rounded-full border bg-background/85 px-2 py-0.5 font-mono text-xs uppercase tracking-[0.14em]"
            style={{ ...f.box(healed.x - 30, healed.y - 64), color: BRAND_VAR.emerald, borderColor: tint("emerald", 40) }}
            {...fade(stage === 3, 1.2)}
          >
            <Check aria-hidden className="h-[1.1em] w-[1.1em]" />
            {v.healed}
          </motion.span>
          <StylisedTag style={{ right: 0, top: 0 }} />
        </div>

        <p className="flex items-center justify-center gap-2 text-base font-semibold text-foreground">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: BRAND_VAR.emerald, boxShadow: `0 0 10px ${tint("emerald", 70)}` }} />
          {v.sameLaptop}
        </p>
        <PhoneScrubber stage={stage} playing={playing} still={still} onStage={choose} onToggle={toggle} />

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{v.ledgerLabel}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {LAYERS.map((layer, i) => {
              const lit = i <= stage;
              const Icon = layer.icon;
              return (
                <li key={layer.id} className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-500"
                    style={{
                      borderColor: tint(layer.brand, lit ? 60 : 18),
                      background: tint(layer.brand, lit ? 18 : 4),
                      boxShadow: lit && i === stage ? `0 0 16px ${tint(layer.brand, 50)}` : "none",
                    }}
                  >
                    <Icon aria-hidden className="h-[18px] w-[18px]" style={{ color: lit ? BRAND_VAR[layer.brand] : "var(--muted-dark)" }} />
                  </span>
                  <span className={`text-base leading-tight transition-colors duration-500 ${lit ? "text-foreground" : "text-muted-dark"}`}>{v.layerLines[layer.id]}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </LayersShell>
  );
}

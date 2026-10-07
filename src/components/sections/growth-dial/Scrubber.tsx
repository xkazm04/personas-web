"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { frame } from "./shared/Shell";
import { LAYERS } from "./shared/layers";
import { H, SCRUB, W } from "./geometry";
import { howSectionsCopy } from "@/i18n/pending/howSections";

const f = frame(W, H);
const TRACK_X = 76;
const TRACK_W = SCRUB.w - TRACK_X - 110;

/**
 * Time scrubber: a draggable, keyboard-steppable range over the four stops,
 * the stops' labels as buttons, and play/pause for the autoplay.
 */
export default function Scrubber({
  stage,
  playing,
  still,
  onStage,
  onToggle,
}: {
  stage: number;
  playing: boolean;
  still: boolean;
  onStage: (s: number) => void;
  onToggle: () => void;
}) {
  const v = howSectionsCopy.layers.v2;
  const at = (s: number) => `${(s / 3) * 100}%`;
  const ease = still ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="absolute" style={f.box(SCRUB.x, SCRUB.y, SCRUB.w, SCRUB.h)}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? v.pause : v.play}
        className="absolute left-0 flex items-center justify-center rounded-full border border-glass bg-background/70 text-foreground transition-colors hover:border-glass-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
        style={{ top: f.u(2), width: f.u(44), height: f.u(44), minWidth: 32, minHeight: 32 }}
      >
        {playing ? <Pause aria-hidden className="h-1/2 w-1/2" /> : <Play aria-hidden className="h-1/2 w-1/2" />}
      </button>

      <div className="absolute" style={{ left: f.u(TRACK_X), width: f.u(TRACK_W), top: f.u(24), height: 0 }}>
        <div className="absolute inset-x-0 -translate-y-1/2 rounded-full bg-foreground/10" style={{ height: f.u(4) }} />
        <motion.div
          className="absolute left-0 -translate-y-1/2 rounded-full"
          style={{
            height: f.u(4),
            background: `linear-gradient(90deg, ${BRAND_VAR.emerald}, ${BRAND_VAR.cyan}, ${BRAND_VAR.purple}, ${BRAND_VAR.amber})`,
            backgroundSize: `${f.u(TRACK_W)} 100%`,
          }}
          initial={false}
          animate={{ width: at(stage) }}
          transition={ease}
        />
        {LAYERS.map((layer, s) => (
          <span
            key={layer.id}
            aria-hidden
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{ left: at(s), width: f.u(14), height: f.u(14), borderColor: BRAND_VAR[layer.brand], background: s <= stage ? BRAND_VAR[layer.brand] : "var(--background)" }}
          />
        ))}
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={stage}
          onChange={(e) => onStage(Number(e.target.value))}
          aria-label={v.scrubLabel}
          aria-valuetext={`${v.stops[stage].when}: ${v.stops[stage].what}`}
          className="peer absolute inset-x-0 -translate-y-1/2 cursor-pointer opacity-0"
          style={{ height: f.u(40), minHeight: 24, margin: 0 }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-background peer-focus-visible:ring-2 peer-focus-visible:ring-brand-cyan"
          style={{ width: f.u(26), height: f.u(26), boxShadow: `0 0 18px ${tint(LAYERS[stage].brand, 70)}` }}
          initial={false}
          animate={{ left: at(stage) }}
          transition={ease}
        />
      </div>

      {v.stops.map((stop, s) => (
        <button
          key={stop.when}
          type="button"
          onClick={() => onStage(s)}
          aria-pressed={s === stage}
          className={`absolute -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${s === stage ? "text-foreground" : "text-muted hover:text-foreground"}`}
          style={{ ...f.fs(16, 13), left: `calc(${f.u(TRACK_X)} + ${f.u(TRACK_W)} * ${s / 3})`, top: f.u(40) }}
        >
          <span className="font-mono uppercase tracking-[0.12em]" style={{ color: s === stage ? BRAND_VAR[LAYERS[s].brand] : undefined }}>
            {stop.when}
          </span>
          {" · "}
          {stop.what}
        </button>
      ))}
    </div>
  );
}

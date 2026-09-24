"use client";

import { useCallback, useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { Bot, Cloud, HardDrive, Monitor, RotateCcw, Sparkles } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import {
  CLAUDE, DURATION, END, OLLAMA, TALL, WIDE, hex, mix, useBeats,
  type Geometry, type Motion, type Plug, type Rect,
} from "./MultiProviderAI.two-sockets.geometry";

function EngineBlock({
  r,
  color,
  name,
  icon: Icon,
  bars,
}: {
  r: Rect;
  color: string;
  name: string;
  icon: typeof Sparkles;
  bars: number[];
}) {
  const bottom = r.y + r.h - 22;
  return (
    <g>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={22} fill={mix(color, 12)} stroke={color} strokeWidth={2} />
      <Icon x={r.x + 20} y={r.y + 20} width={30} height={30} color={color} strokeWidth={1.75} aria-hidden />
      <text x={r.x + 60} y={r.y + 44} fontSize={24} fontWeight={600} fill="currentColor">
        {name}
      </text>
      <g aria-hidden>
        {bars.map((h, i) => (
          <rect key={i} x={r.x + 22 + i * 24} y={bottom - h} width={16} height={h} rx={4} fill={color} opacity={0.35 + i * 0.2} />
        ))}
      </g>
    </g>
  );
}

function PlugHead({ plug, color, x, lit }: { plug: Plug; color: string; x: MotionValue<number>; lit: MotionValue<number> }) {
  return (
    <g transform={`translate(${plug.ox} ${plug.oy}) rotate(${plug.rot})`} aria-hidden>
      {/* the track the plug travels along, always visible */}
      <line x1={0} y1={0} x2={plug.cable} y2={0} stroke={color} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="4 7" />
      {/* the live cable, solid once seated */}
      <motion.line x1={0} y1={0} x2={plug.travel} y2={0} stroke={color} strokeWidth={4} strokeLinecap="round" style={{ opacity: lit }} />
      <motion.g style={{ x }}>
        <rect x={0} y={-15} width={30} height={30} rx={7} fill={color} />
        <rect x={30} y={-10} width={12} height={5} rx={1.5} fill={color} />
        <rect x={30} y={5} width={12} height={5} rx={1.5} fill={color} />
      </motion.g>
    </g>
  );
}

function Socket({ r, color, lit }: { r: Rect; color: string; lit: MotionValue<number> }) {
  return (
    <g aria-hidden>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={5} fill="var(--background, #0a0e14)" stroke="currentColor" strokeOpacity={0.45} strokeWidth={2} />
      <motion.rect x={r.x} y={r.y} width={r.w} height={r.h} rx={5} fill={mix(color, 70)} style={{ opacity: lit }} />
    </g>
  );
}

function Picture({ g, m, className }: { g: Geometry; m: Motion; className: string }) {
  const { cx, cy, r, rot } = g.core;
  const outline = hex(cx, cy, r, rot);
  const origin = { transformBox: "view-box" as const, transformOrigin: `${cx}px ${cy}px` };
  const M = g.machine;
  return (
    <svg viewBox={`0 0 ${g.vb[0]} ${g.vb[1]}`} className={`h-auto w-full text-foreground ${className}`}>
      {/* Your machine: a dashed boundary; Claude sits outside it, Ollama inside */}
      <rect x={M.x} y={M.y} width={M.w} height={M.h} rx={28} fill={mix(OLLAMA, 4)} stroke={OLLAMA} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="10 8" aria-hidden />
      <Monitor x={M.x + 24} y={M.y + 20} width={24} height={24} color={OLLAMA} strokeWidth={1.75} aria-hidden />
      <text x={M.x + 58} y={M.y + 38} fontSize={18} className="font-mono" letterSpacing={1} fill={OLLAMA}>
        Your machine
      </text>

      <Cloud x={g.cloud.x} y={g.cloud.y} width={44} height={44} color={CLAUDE} strokeOpacity={0.6} strokeWidth={1.5} aria-hidden />

      <EngineBlock r={g.claude} color={CLAUDE} name="Claude" icon={Sparkles} bars={[14, 26, 38]} />
      <EngineBlock r={g.ollama} color={OLLAMA} name="Ollama" icon={HardDrive} bars={[22, 22, 22]} />

      <PlugHead plug={g.plugA} color={CLAUDE} x={m.plugA} lit={m.litA} />
      <PlugHead plug={g.plugB} color={OLLAMA} x={m.plugB} lit={m.litB} />

      {/* the runtime core: two halos (one per engine), the hexagon, identical response to either */}
      <motion.polygon points={outline} fill="none" stroke={OLLAMA} strokeWidth={2} style={{ ...origin, scale: m.ringBScale, opacity: m.ringBOpacity }} aria-hidden />
      <motion.polygon points={outline} fill="none" stroke={CLAUDE} strokeWidth={2} style={{ ...origin, scale: m.ringAScale, opacity: m.ringAOpacity }} aria-hidden />
      <polygon points={outline} fill="var(--background, #0a0e14)" stroke="currentColor" strokeOpacity={0.55} strokeWidth={2.5} aria-hidden />
      <polygon points={outline} fill="currentColor" fillOpacity={0.04} aria-hidden />
      <motion.polygon points={outline} fill={mix(CLAUDE, 40)} style={{ opacity: m.flashA }} aria-hidden />
      <motion.polygon points={outline} fill={mix(OLLAMA, 40)} style={{ opacity: m.flashB }} aria-hidden />
      <polygon points={hex(cx, cy, r * 0.72, rot)} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={1.5} strokeDasharray="3 6" aria-hidden />
      <motion.g style={{ ...origin, scale: m.beat }}>
        <Bot x={cx - 24} y={cy - 46} width={48} height={48} strokeWidth={1.5} aria-hidden />
        <text x={cx} y={cy + 32} fontSize={20} fontWeight={600} textAnchor="middle" fill="currentColor">
          Runtime
        </text>
      </motion.g>

      <Socket r={g.socketA} color={CLAUDE} lit={m.litA} />
      <Socket r={g.socketB} color={OLLAMA} lit={m.litB} />
    </svg>
  );
}

export default function TwoSocketsArt({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStillMotion();
  const inView = useInView(ref, { once: true, amount: 0.35 });
  // Server and first paint: the resolved end state, both engines seated.
  const p = useMotionValue(END);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const wide = useBeats(p, WIDE);
  const tall = useBeats(p, TALL);

  const play = useCallback(() => {
    run.current?.stop();
    p.set(0);
    run.current = animate(p, END, { duration: DURATION, ease: "linear" });
  }, [p]);

  useEffect(() => {
    if (still) {
      run.current?.stop();
      p.set(END);
      return;
    }
    if (inView) play();
  }, [inView, still, play, p]);

  useEffect(() => () => run.current?.stop(), []);

  return (
    <div
      ref={ref}
      data-illustrate-art
      role="figure"
      aria-label="One Personas runtime core with two sockets: Claude plugs in from the cloud, Ollama plugs in on your own machine, and the core responds the same to either."
      className={`relative rounded-3xl border border-glass bg-white/[0.02] p-4 md:p-8 ${className}`}
    >
      <Picture g={WIDE} m={wide} className="hidden md:block" />
      <Picture g={TALL} m={tall} className="md:hidden" />
      <button
        type="button"
        onClick={play}
        disabled={still}
        aria-label="Replay animation"
        className="absolute right-3 top-3 rounded-full border border-glass bg-white/[0.04] p-2 text-foreground/60 transition-colors hover:text-foreground disabled:hidden"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

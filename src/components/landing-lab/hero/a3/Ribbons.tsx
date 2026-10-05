"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { KX, KY, STRANDS, VB_H, VB_W, strandPath, strandValues } from "./geometry";

const sv = (o: Record<string, string | number>) => o as CSSProperties;
const HEX = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    return `${(KX + Math.cos(a) * r).toFixed(1)},${(KY + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");

const strands = Array.from({ length: STRANDS }, (_, k) => {
  const u = Math.abs((k - (STRANDS - 1) / 2) / ((STRANDS - 1) / 2));
  return { k, d0: strandPath(k, 0), values: strandValues(k), w: 1.3 + (1 - u) * 1.9, o: 0.5 + (1 - u) * 0.45, dl: `${(k * 0.07).toFixed(2)}s` };
});

/** Deterministic star dust (a tiny LCG), so server and client agree. */
const STARS = (() => {
  let s = 7;
  const next = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 56 }, (_, i) => ({ x: next() * VB_W, y: 60 + next() * 520, r: 0.8 + next() * 1.6, o: 0.25 + next() * 0.45, tw: i % 4 === 0 }));
})();

interface Props {
  running: boolean;
  label: string;
  tags: { event: string; team: string; overseer: string };
}

/** The A3 artwork: nine strands that tangle on the left, pass the Overseer knot and leave as ordered lanes. */
export default function Ribbons({ running, label, tags }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (running) svg.unpauseAnimations();
    else {
      svg.setCurrentTime(0);
      svg.pauseAnimations();
    }
  }, [running]);

  return (
    <svg ref={ref} className="a3-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <defs>
        <linearGradient id="a3-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={VB_W} y2="0">
          <stop offset="0" stopColor="var(--brand-cyan)" />
          <stop offset=".3" stopColor="var(--brand-purple)" />
          <stop offset=".5" stopColor="var(--brand-amber)" />
          <stop offset=".68" stopColor="var(--brand-emerald)" />
          <stop offset="1" stopColor="var(--brand-cyan)" />
        </linearGradient>
        <radialGradient id="a3-halo">
          <stop offset="0" stopColor="var(--brand-amber)" stopOpacity=".5" />
          <stop offset=".45" stopColor="var(--brand-purple)" stopOpacity=".16" />
          <stop offset="1" stopColor="var(--brand-purple)" stopOpacity="0" />
        </radialGradient>
        {strands.map((s) => (
          <path key={s.k} id={`a3-s${s.k}`} d={s.d0} pathLength="1000" fill="none">
            <animate attributeName="d" dur="20s" repeatCount="indefinite" values={s.values} />
          </path>
        ))}
      </defs>

      {STARS.map((s, i) => (
        <circle key={i} cx={s.x.toFixed(0)} cy={s.y.toFixed(0)} r={s.r.toFixed(1)} fill="var(--foreground)" opacity={s.o.toFixed(2)} className={s.tw ? "a3-breathe" : undefined} style={s.tw ? sv({ animationDelay: `${i * 0.37}s` }) : undefined} />
      ))}
      <circle cx={KX} cy={KY} r="420" fill="url(#a3-halo)" className="a3-breathe" />
      {strands.map((s) => (
        <g key={s.k} style={sv({ "--dl": s.dl })}>
          <use href={`#a3-s${s.k}`} className="a3-glow" strokeWidth={s.w * 7} opacity={0.1} />
          <use href={`#a3-s${s.k}`} className="a3-core" strokeWidth={s.w} opacity={s.o} />
          {[0, 1].map((n) => (
            <use
              key={n}
              href={`#a3-s${s.k}`}
              className="a3-pulse"
              style={sv({ "--o": (s.k * 137 + n * 480) % 960, "--t": `${9 + ((s.k + n * 3) % 4) * 1.6}s` })}
            />
          ))}
        </g>
      ))}

      {/* The Overseer knot, where every strand passes through. */}
      <g>
        <circle cx={KX} cy={KY} r="104" fill="none" stroke="var(--foreground)" strokeOpacity=".28" strokeDasharray="3 9" className="a3-spin" style={sv({ "--sp": "50s" })} />
        <polygon points={HEX(74)} fill="none" stroke="var(--brand-amber)" strokeOpacity=".7" strokeWidth="1.5" className="a3-spin" style={sv({ "--sp": "38s" })} />
        <polygon points={HEX(48)} fill="color-mix(in srgb, var(--brand-amber) 14%, transparent)" stroke="var(--foreground)" strokeOpacity=".6" className="a3-spin" style={sv({ "--sp": "28s", animationDirection: "reverse" })} />
        <circle cx={KX} cy={KY} r="17" fill="var(--brand-amber)" />
        <circle cx={KX} cy={KY} r="6" fill="var(--foreground)" />
      </g>

      <text className="a3-tag" x="190" y={KY - 175}>{tags.event}</text>
      <text className="a3-tag" x={KX} y={KY - 132} textAnchor="middle">{tags.overseer}</text>
      <text className="a3-tag" x={VB_W - 190} y={KY - 175} textAnchor="end">{tags.team}</text>
    </svg>
  );
}

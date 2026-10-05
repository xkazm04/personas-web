import type { CSSProperties, ReactNode } from "react";

const sv = (o: Record<string, string | number>) => o as CSSProperties;

/** Honeycomb cells (axial grid, radius 2) for the personas layer. */
const HEX_R = 6.4;
const HEXES = (() => {
  const out: { x: number; y: number }[] = [];
  for (let q = -2; q <= 2; q++)
    for (let r = Math.max(-2, -q - 2); r <= Math.min(2, -q + 2); r++)
      out.push({ x: 50 + HEX_R * 1.732 * (q + r / 2), y: 50 + HEX_R * 1.5 * r });
  return out;
})();
const hexPts = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    return `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");

const EVENT_SPOTS: [number, number][] = [[20, 24], [72, 18], [34, 62], [82, 58], [58, 84], [14, 80]];
const TEAM_CENTRES: [number, number][] = [[50, 22], [26, 64], [74, 64]];

export function EventsArt({ pat }: { pat: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <pattern id={pat} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r=".5" fill="var(--c)" opacity=".5" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#${pat})`} />
      {EVENT_SPOTS.map(([x, y], i) => (
        <g key={i}>
          <circle className="a2-ripple" style={sv({ "--rd": `${i * 0.6}s` })} cx={x} cy={y} r="2" fill="none" stroke="var(--c)" strokeWidth=".6" />
          <path d={`M${x} ${y - 1.8} L${x + 1.8} ${y} L${x} ${y + 1.8} L${x - 1.8} ${y} Z`} fill="var(--c)" stroke="var(--foreground)" strokeWidth=".4" />
        </g>
      ))}
    </svg>
  );
}

export function PersonasArt() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      {HEXES.map((h, i) => {
        const lit = i % 3 === 0;
        return (
          <polygon
            key={i}
            className={lit ? "a2-pulse" : undefined}
            style={sv({ "--rd": `${(i % 7) * 0.45}s` })}
            points={hexPts(h.x, h.y, HEX_R * 0.9)}
            fill={lit ? "color-mix(in srgb, var(--c) 55%, transparent)" : "color-mix(in srgb, var(--c) 8%, transparent)"}
            stroke="var(--c)"
            strokeWidth=".5"
            opacity={lit ? 0.5 : 0.8}
          />
        );
      })}
    </svg>
  );
}

export function TeamsArt() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 22 L26 64 L74 64 Z" fill="none" stroke="var(--c)" strokeWidth=".6" strokeDasharray="2 4" className="a2-flow" />
      {TEAM_CENTRES.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="11" fill="color-mix(in srgb, var(--c) 10%, transparent)" stroke="var(--c)" strokeWidth=".5" />
          <circle cx={x} cy={y} r="2.2" fill="var(--c)" />
          <g className="a2-spin-c" style={sv({ "--sp": `${16 + i * 5}s` })}>
            {[0, 120, 240].map((a) => (
              <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 11} cy={y + Math.sin((a * Math.PI) / 180) * 11} r="1.9" fill="var(--foreground)" />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}

const RINGS: [number, string, string][] = [[14, "30s", "3 3"], [24, "20s", "6 3"], [36, "44s", "2 5"]];

export function OverseerArt({ grad }: { grad: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--c)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--c)" stopOpacity=".6" />
        </linearGradient>
      </defs>
      <g className="a2-spin" style={sv({ "--sp": "9s" })}>
        <path d="M50 50 L50 8 A42 42 0 0 1 86 29 Z" fill={`url(#${grad})`} />
        <line x1="50" y1="50" x2="86" y2="29" stroke="var(--c)" strokeWidth=".8" />
      </g>
      {RINGS.map(([r, sp, dash], i) => (
        <circle key={r} className="a2-spin" style={sv({ "--sp": sp, animationDirection: i === 1 ? "reverse" : "normal" })} cx="50" cy="50" r={r} fill="none" stroke="var(--c)" strokeWidth=".6" strokeDasharray={dash} />
      ))}
      <circle cx="50" cy="50" r="6" fill="var(--c)" opacity=".35" />
      <circle cx="50" cy="50" r="3.4" fill="var(--c)" />
      <circle cx="50" cy="50" r="1.3" fill="var(--foreground)" />
    </svg>
  );
}

export function Plane({ z, c, d, label, children }: { z: number; c: string; d: string; label: string; children: ReactNode }) {
  return (
    <div className="a2-plane" style={sv({ "--z": z, "--c": c, "--d": d })}>
      {children}
      <span className="a2-label">
        <i />
        {label}
      </span>
    </div>
  );
}

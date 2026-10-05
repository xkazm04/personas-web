"use client";

import { createElement, useId, type CSSProperties } from "react";
import type { FleetAgent } from "../fleet-data";
import { familyShapes, type Shape } from "./emblem-shapes";
import { hash, mulberry32 } from "./model";
import s from "./board.module.css";

interface EmblemProps {
  agent: Pick<FleetAgent, "id" | "callsign" | "team" | "hue">;
  /** The layered, lit version (spotlight and scenes); otherwise a flat glyph. */
  rich?: boolean;
  /** Ambient orbit rotation (rich only); the caller gates it on motion + visibility. */
  live?: boolean;
  className?: string;
}

const f1 = (n: number) => Math.round(n * 10) / 10;

function draw(shapes: Shape[], stroke: CSSProperties, fill: CSSProperties | null, keyPrefix: string) {
  return shapes.map((sh, i) =>
    createElement(sh.el, {
      key: `${keyPrefix}${i}`,
      ...sh.a,
      style: sh.fill && fill ? { ...stroke, ...fill } : { ...stroke, fill: "none" },
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }),
  );
}

/** A persona's procedural emblem. Stylised art: callers label it as such. */
export default function Emblem({ agent, rich = false, live = false, className }: EmblemProps) {
  const uid = useId().replace(/:/g, "");
  const r = mulberry32(hash(agent.callsign + agent.id));
  const rot = f1((r() - 0.5) * 14);
  const shapes = familyShapes(agent.team, r);
  const hueStyle = { "--h": agent.hue } as CSSProperties;

  if (!rich) {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={`${s.emblem} ${className ?? ""}`} style={hueStyle}>
        <g transform={`rotate(${rot} 50 50)`}>
          {draw(shapes, { stroke: "var(--em-main)", strokeWidth: 6 }, { fill: "var(--em-main)", fillOpacity: 0.28 }, "b")}
        </g>
      </svg>
    );
  }

  const dots = Array.from({ length: 7 }, () => {
    const a = r() * Math.PI * 2;
    const rr = 41 + r() * 6;
    return { cx: f1(50 + rr * Math.cos(a)), cy: f1(50 + rr * Math.sin(a)), r: f1(0.6 + r() * 1.1), o: f1(0.3 + r() * 0.5) };
  });
  const dash = 2 + Math.floor(r() * 6);
  const id = (k: string) => `${uid}${k}`;

  return (
    <svg viewBox="-6 -6 112 112" aria-hidden="true" focusable="false" className={`${s.emblem} ${className ?? ""}`} style={hueStyle}>
      <defs>
        <radialGradient id={id("g")} cx="50%" cy="46%" r="55%">
          <stop offset="0" style={{ stopColor: "var(--em-main)", stopOpacity: 0.55 }} />
          <stop offset=".45" style={{ stopColor: "var(--em-main)", stopOpacity: 0.12 }} />
          <stop offset="1" style={{ stopColor: "var(--em-main)", stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id={id("f")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--em-main)", stopOpacity: 0.55 }} />
          <stop offset="1" style={{ stopColor: "var(--em-deep)", stopOpacity: 0.85 }} />
        </linearGradient>
        <linearGradient id={id("s")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--em-light)" }} />
          <stop offset="1" style={{ stopColor: "var(--em-main)" }} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="56" fill={`url(#${id("g")})`} />
      <g className={live ? s.orbitLive : s.orbit}>
        <circle cx="50" cy="50" r="45" fill="none" style={{ stroke: "var(--em-main)", strokeOpacity: 0.35 }} strokeWidth=".7" strokeDasharray={`${dash} ${dash + 3}`} />
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} style={{ fill: "var(--em-light)" }} opacity={d.o} />
        ))}
      </g>
      <circle cx="50" cy="50" r="38" style={{ fill: "var(--em-deep)", fillOpacity: 0.35, stroke: "var(--em-main)", strokeOpacity: 0.18 }} strokeWidth=".6" />
      <g transform={`rotate(${rot} 50 50)`}>
        <g transform="translate(1.6 2.4)" opacity=".9">
          {draw(shapes, { stroke: "var(--em-deep)", strokeWidth: 7 }, { fill: "var(--em-deep)" }, "d")}
        </g>
        {draw(shapes, { stroke: `url(#${id("s")})`, strokeWidth: 3.2 }, { fill: `url(#${id("f")})` }, "m")}
        <g opacity=".7">{draw(shapes, { stroke: "var(--em-light)", strokeWidth: 1 }, null, "h")}</g>
      </g>
    </svg>
  );
}

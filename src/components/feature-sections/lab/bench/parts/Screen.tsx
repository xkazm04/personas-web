"use client";

import { useId, type ReactNode } from "react";
import { useScreenBox, type Box } from "./useScreenBox";

export interface Plot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Pad {
  l: number;
  r: number;
  t: number;
  b: number;
}

/**
 * A phosphor screen: an inset glass pane drawing an SVG in its own pixels,
 * with the graticule (10 x 8 divisions, a centre crosshair carrying minor
 * calibration ticks) laid over the plot area. `children` receives the plot
 * rect, the full box and the id of the phosphor glow filter.
 */
export default function Screen({
  label,
  pad,
  divisions = [10, 8],
  className = "",
  children,
}: {
  label: string;
  pad: Pad;
  divisions?: [number, number];
  className?: string;
  children: (plot: Plot, box: Box, glow: string) => ReactNode;
}) {
  const [ref, box] = useScreenBox<HTMLDivElement>();
  const glow = `glow-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const plot: Plot = {
    x: pad.l,
    y: pad.t,
    w: Math.max(1, box.w - pad.l - pad.r),
    h: Math.max(1, box.h - pad.t - pad.b),
  };
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-lg border border-glass bg-foreground/[0.03] ${className}`}
      style={{ boxShadow: "inset 0 0 2.5rem color-mix(in srgb, var(--foreground) 6%, transparent)" }}
    >
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${box.w} ${box.h}`}
        className="absolute inset-0 h-full w-full text-foreground"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={glow} x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <Graticule plot={plot} divisions={divisions} />
        {children(plot, box, glow)}
      </svg>
    </div>
  );
}

function Graticule({ plot, divisions }: { plot: Plot; divisions: [number, number] }) {
  const [nx, ny] = divisions;
  const cx = plot.x + plot.w / 2;
  const cy = plot.y + plot.h / 2;
  const minorX = Array.from({ length: nx * 5 - 1 }, (_, i) => plot.x + ((i + 1) / (nx * 5)) * plot.w);
  const minorY = Array.from({ length: ny * 5 - 1 }, (_, j) => plot.y + ((j + 1) / (ny * 5)) * plot.h);
  return (
    <g aria-hidden stroke="currentColor" fill="none" shapeRendering="crispEdges">
      <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} strokeOpacity={0.22} />
      <g strokeOpacity={0.09} strokeDasharray="1 3">
        {Array.from({ length: nx - 1 }, (_, i) => {
          const x = plot.x + ((i + 1) / nx) * plot.w;
          return <line key={`gx${i}`} x1={x} x2={x} y1={plot.y} y2={plot.y + plot.h} />;
        })}
        {Array.from({ length: ny - 1 }, (_, j) => {
          const y = plot.y + ((j + 1) / ny) * plot.h;
          return <line key={`gy${j}`} x1={plot.x} x2={plot.x + plot.w} y1={y} y2={y} />;
        })}
      </g>
      <g strokeOpacity={0.2}>
        <line x1={cx} x2={cx} y1={plot.y} y2={plot.y + plot.h} />
        <line x1={plot.x} x2={plot.x + plot.w} y1={cy} y2={cy} />
        {minorX.map((x) => (
          <line key={`mx${x}`} x1={x} x2={x} y1={cy - 3} y2={cy + 3} />
        ))}
        {minorY.map((y) => (
          <line key={`my${y}`} x1={cx - 3} x2={cx + 3} y1={y} y2={y} />
        ))}
      </g>
    </g>
  );
}

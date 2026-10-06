"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import type { ChipNode } from "./geometry";

const SURFACE = "color-mix(in srgb, var(--background) 90%, var(--foreground))";

/** A circuit chip: body, pins, status lamp, logo or drawn glyph, label. */
export default function Chip({
  node,
  label,
  sub,
  hurt,
  running,
}: {
  node: ChipNode;
  label: string;
  sub?: string;
  /** Brand colour while this chip is part of a failure, else healthy. */
  hurt: BrandKey | null;
  running: boolean;
}) {
  const { x, y, w, h } = node;
  const key: BrandKey = hurt ?? "emerald";
  const left = x - w / 2;
  const top = y - h / 2;
  const pins = [-0.3, -0.1, 0.1, 0.3].map((f) => y + f * h);
  return (
    <g>
      <rect x={left} y={top + 4} width={w} height={h} rx={12} fill="color-mix(in srgb, var(--background) 40%, transparent)" />
      {pins.map((py) => (
        <g key={py} fill={tint(key, 45)}>
          <rect x={left - 7} y={py - 1.5} width={7} height={3} rx={1} />
          <rect x={left + w} y={py - 1.5} width={7} height={3} rx={1} />
        </g>
      ))}
      <rect x={left} y={top} width={w} height={h} rx={12} fill={SURFACE} stroke={tint(key, hurt ? 85 : 40)} strokeWidth={hurt ? 2.2 : 1.4} />
      {hurt && (
        <motion.rect
          x={left - 5}
          y={top - 5}
          width={w + 10}
          height={h + 10}
          rx={16}
          fill="none"
          stroke={BRAND_VAR[key]}
          strokeWidth={1.4}
          filter="url(#hl-glow)"
          initial={{ opacity: 0.7 }}
          animate={running ? { opacity: [0.35, 0.95, 0.35] } : { opacity: 0.7 }}
          transition={running ? { duration: 1.1, repeat: Infinity } : { duration: 0.3 }}
        />
      )}
      <circle cx={left + w - 12} cy={top + 12} r={4} fill={BRAND_VAR[key]} />
      {node.logo ? (
        <image href={node.logo} x={x - 14} y={y - 30} width={28} height={28} className="connector-icon" />
      ) : (
        <Glyph id={node.id} x={x} y={node.id === "agent" ? y - 26 : y - 16} />
      )}
      <text x={x} y={node.id === "agent" ? y + 14 : y + 24} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={650}>
        {label}
      </text>
      {sub && (
        <text x={x} y={y + 36} textAnchor="middle" fill="var(--foreground)" fillOpacity={0.7} fontSize={14}>
          {sub}
        </text>
      )}
    </g>
  );
}

/** Drawn glyphs for the chips without a connector logo. */
function Glyph({ id, x, y }: { id: string; x: number; y: number }) {
  const stroke = "var(--foreground)";
  if (id === "schedule")
    return (
      <g fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" opacity={0.85}>
        <circle cx={x} cy={y} r={13} />
        <path d={`M ${x} ${y - 7} L ${x} ${y} L ${x + 6} ${y + 4}`} />
      </g>
    );
  if (id === "report")
    return (
      <g fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" opacity={0.85}>
        <path d={`M ${x - 10} ${y - 14} h 14 l 6 6 v 22 h -20 z`} />
        <path d={`M ${x - 5} ${y - 2} h 10 M ${x - 5} ${y + 4} h 10`} />
      </g>
    );
  // agent: a persona mark, head over a lit core
  return (
    <g>
      <circle cx={x} cy={y} r={17} fill={tint("cyan", 14)} stroke={BRAND_VAR.cyan} strokeWidth={1.6} />
      <circle cx={x} cy={y - 5} r={5.5} fill={BRAND_VAR.cyan} />
      <path d={`M ${x - 9} ${y + 10} q 9 -10 18 0`} fill="none" stroke={BRAND_VAR.cyan} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

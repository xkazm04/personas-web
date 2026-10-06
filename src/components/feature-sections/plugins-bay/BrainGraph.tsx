"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import {
  CENTRAL,
  EDGES,
  NODE_ICON,
  SATELLITES,
  nodeById,
} from "@/components/feature-sections/plugins/second-brain/secondBrainData";

const P = "var(--brand-purple)";
const mix = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
/** Inset the live graph's 0..100 layout so edge chips never touch the frame. */
const at = (v: number) => 9 + v * 0.82;

/**
 * The vault as a lit graph. The note being recalled is the story: its edge
 * brightens, a spark travels out from the hub to it, and the chip glows -
 * while the side panel lights the matching backlink.
 */
export default function BrainGraph({ recalled, run }: { recalled: string; run: boolean }) {
  const target = nodeById(recalled);
  return (
    <div
      className="relative h-full overflow-hidden rounded-2xl border"
      style={{
        borderColor: mix(P, 22),
        background: `radial-gradient(circle at 50% 50%, ${mix(P, 16)}, ${mix(P, 3)} 55%, transparent 80%)`,
      }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {EDGES.map(([a, b]) => {
          const from = nodeById(a);
          const to = nodeById(b);
          const hot = (a === "central" && b === recalled) || (b === "central" && a === recalled);
          return (
            <line
              key={`${a}-${b}`}
              x1={at(from.x)}
              y1={at(from.y)}
              x2={at(to.x)}
              y2={at(to.y)}
              stroke={hot ? P : mix(P, 35)}
              strokeWidth={hot ? 2 : 1}
              vectorEffect="non-scaling-stroke"
              style={{ transition: "stroke 400ms, stroke-width 400ms" }}
            />
          );
        })}
      </svg>

      {[0, 1.4, 2.8].map((delay) => (
        <motion.span
          key={delay}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderColor: mix(P, 45) }}
          initial={{ scale: 1, opacity: 0 }}
          animate={run ? { scale: [0.5, 3.2], opacity: [0.55, 0] } : { scale: 1, opacity: 0 }}
          transition={run ? { duration: 4.2, delay, repeat: Infinity, ease: "easeOut" } : { duration: 0 }}
        />
      ))}

      <motion.span
        key={recalled}
        aria-hidden="true"
        className="absolute z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: P, boxShadow: `0 0 14px ${P}` }}
        initial={run ? { left: `${at(CENTRAL.x)}%`, top: `${at(CENTRAL.y)}%`, opacity: 1 } : false}
        animate={{ left: `${at(target.x)}%`, top: `${at(target.y)}%`, opacity: run ? [1, 1, 0] : 0 }}
        transition={run ? { duration: 0.9, ease: "easeOut" } : { duration: 0 }}
      />

      {SATELLITES.map((node) => {
        const Icon = NODE_ICON[node.type];
        const hot = node.id === recalled;
        return (
          <span
            key={node.id}
            className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[13px] transition-[box-shadow,border-color,background] duration-500"
            style={{
              left: `${at(node.x)}%`,
              top: `${at(node.y)}%`,
              borderColor: hot ? P : mix("var(--foreground)", 16),
              background: hot ? `color-mix(in srgb, ${P} 22%, var(--background))` : "color-mix(in srgb, var(--background) 88%, transparent)",
              boxShadow: hot ? `0 0 22px ${mix(P, 45)}` : undefined,
              color: hot ? "var(--foreground)" : "color-mix(in srgb, var(--foreground) 80%, transparent)",
            }}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: node.type === "idea" ? "var(--brand-amber)" : P }} aria-hidden="true" />
            {node.label}
          </span>
        );
      })}

      <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl border"
          style={{ borderColor: mix(P, 60), background: `color-mix(in srgb, ${P} 24%, var(--background))`, boxShadow: `0 0 30px ${mix(P, 40)}` }}
        >
          <Brain className="h-7 w-7" style={{ color: P }} aria-hidden="true" />
        </span>
        <span className="rounded-md border px-2 py-0.5 font-mono text-[13px] text-foreground" style={{ borderColor: mix(P, 35), background: "color-mix(in srgb, var(--background) 90%, transparent)" }}>
          {CENTRAL.label}
        </span>
      </div>
    </div>
  );
}

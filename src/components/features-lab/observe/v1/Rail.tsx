"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { leftModules, rightModules } from "@/components/feature-sections/observability-deck/data";
import type { OverviewModule } from "@/components/feature-sections/observability-deck/types";
import { useTranslation } from "@/i18n/useTranslation";
import { frame } from "../shared/Stage";
import { beat } from "../shared/motion";
import { DECK, H, W } from "./data";

/* The two rails of module tags (the live section's filter controls): pressing
 * one lights the matching spans across every lane and dims the rest. */

const { place, fs } = frame(W, H);
const TAG_H = 120;
const GAP = 14;
const Y0 = (H - (4 * TAG_H + 3 * GAP)) / 2;
const RAIL_W = DECK.x - 18;

function Tag({ mod, x, i, active, onToggle, p }: {
  mod: OverviewModule;
  x: number;
  i: number;
  active: boolean;
  onToggle: () => void;
  p: MotionValue<number>;
}) {
  const words = useTranslation().t.observeSection.modules[mod.id];
  const Icon = mod.icon;
  const opacity = useTransform(p, (v) => beat(v, 0.1 + i * 0.05, 0.25));
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`group flex cursor-pointer flex-col justify-center rounded-2xl border px-[0.75em] text-left backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${
        active ? "" : "border-glass bg-foreground/[0.03] hover:border-glass-hover hover:bg-foreground/[0.06]"
      }`}
      style={{
        ...place(x, Y0 + i * (TAG_H + GAP), RAIL_W, TAG_H),
        ...fs(16, 16),
        opacity,
        ...(active
          ? {
              borderColor: `color-mix(in srgb, ${mod.color} 65%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${mod.color} 12%, transparent)`,
              boxShadow: `0 0 28px color-mix(in srgb, ${mod.color} 28%, transparent), inset 0 1px 0 color-mix(in srgb, ${mod.color} 40%, transparent)`,
            }
          : {}),
      }}
    >
      <span className="flex items-center gap-[0.5em] font-semibold leading-tight text-foreground" style={{ fontSize: "1.1em" }}>
        <span
          className="flex h-[1.6em] w-[1.6em] shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `color-mix(in srgb, ${mod.color} ${active ? 30 : 16}%, transparent)` }}
        >
          <Icon className="h-[0.95em] w-[0.95em]" style={{ color: mod.color }} aria-hidden />
        </span>
        {words.title}
      </span>
      <span className="mt-[0.35em] leading-snug text-foreground/75">{words.blurb}</span>
    </motion.button>
  );
}

export default function Rails({ activeId, onToggle, p }: { activeId: string | null; onToggle: (mod: OverviewModule) => void; p: MotionValue<number> }) {
  return (
    <>
      {leftModules.map((m, i) => (
        <Tag key={m.id} mod={m} x={0} i={i} active={activeId === m.id} onToggle={() => onToggle(m)} p={p} />
      ))}
      {rightModules.map((m, i) => (
        <Tag key={m.id} mod={m} x={W - RAIL_W} i={i} active={activeId === m.id} onToggle={() => onToggle(m)} p={p} />
      ))}
    </>
  );
}

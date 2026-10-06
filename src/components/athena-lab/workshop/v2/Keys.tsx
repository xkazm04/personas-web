"use client";

import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { ANNOTATION } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Glyph, type Frame } from "../shared/art";
import { BRANDS, type Scene } from "./data";
import type { V2Layout } from "./layout";

/**
 * Your keys - one per room, each tagged with its tool's real mark, hanging
 * from your ring on your side of the plan.
 *
 * Handing one over is the scene's only control gesture: the tag leaves its
 * place on the ring, crosses to its room and hangs just inside the door it
 * opened. The keys you keep never move. At the end of the loop the ring still
 * holds exactly those two - however much you handed her, they are still yours.
 *
 * Movement is a transform measured in the tag's own size (framer's x/y
 * percentages), so the flight is exact at every stage size.
 */
const FLY = { type: "spring", stiffness: 55, damping: 14 } as const;

export default function Keys({ scene, g, f, reduced }: { scene: Scene; g: V2Layout; f: Frame; reduced: boolean }) {
  const c = useTranslation().t.athenaLab.workshop.v2;
  const k = g.keys;
  const { ring, tag } = k;

  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: scene.named ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.6 }}
    >
      <div
        className="absolute rounded-2xl border bg-surface/70 backdrop-blur-md"
        style={{ ...f.box(k.panel.x, k.panel.y, k.panel.w, k.panel.h), borderColor: tint("cyan", 20), boxShadow: `inset 0 1px 0 ${tint("cyan", 18)}` }}
      />
      <span className={`absolute whitespace-nowrap ${ANNOTATION}`} style={{ ...f.box(k.head.x, k.head.y), ...f.fs(15, 12) }}>
        {c.keys}
      </span>

      <svg viewBox={`0 0 ${g.W} ${g.H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx={ring.x} cy={ring.y} r={ring.r} fill="none" stroke={tint("cyan", 60)} strokeWidth={3} />
        {k.slots.map((s, i) => (
          <motion.line
            key={i}
            x1={ring.x}
            y1={ring.y + ring.r}
            x2={s.x}
            y2={s.y - tag.h / 2}
            stroke={tint("cyan", 24)}
            strokeWidth={1.5}
            initial={false}
            animate={{ opacity: scene.rooms[i] === "dark" ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          />
        ))}
      </svg>

      {/* The hook each key hangs from - left empty once it is handed over */}
      {k.slots.map((s, i) => (
        <span
          key={`hook-${i}`}
          className="absolute rounded-xl border border-dashed"
          style={{ ...f.box(s.x - tag.w / 2, s.y - tag.h / 2, tag.w, tag.h), borderColor: tint("cyan", 22) }}
          aria-hidden="true"
        />
      ))}

      {k.slots.map((s, i) => {
        const handed = scene.rooms[i] !== "dark";
        const hook = g.rooms[i].hook;
        return (
          <motion.span
            key={i}
            className="absolute flex items-center justify-center rounded-xl border bg-background"
            style={{
              ...f.box(s.x - tag.w / 2, s.y - tag.h / 2, tag.w, tag.h),
              gap: f.len(8, 4),
              borderColor: tint("cyan", handed ? 70 : 34),
              boxShadow: handed ? `0 0 18px ${tint("cyan", 40)}` : undefined,
            }}
            initial={false}
            animate={{
              x: handed ? `${((hook.x - s.x) / tag.w) * 100}%` : "0%",
              y: handed ? `${((hook.y - s.y) / tag.h) * 100}%` : "0%",
              scale: handed ? 0.62 : 1,
            }}
            transition={reduced ? { duration: 0 } : FLY}
          >
            <Glyph src={`/tools/${BRANDS[i]}.svg`} color={handed ? BRAND_VAR.cyan : "var(--foreground)"} size={f.len(22, 14)} />
            <KeyRound className="shrink-0 text-brand-cyan" style={{ width: f.len(22, 14), height: f.len(22, 14) }} aria-hidden="true" />
          </motion.span>
        );
      })}
    </motion.div>
  );
}

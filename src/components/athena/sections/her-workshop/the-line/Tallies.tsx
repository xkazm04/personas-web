"use client";

import { AnimatePresence, motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { Frame } from "./shared/art";
import Her, { type Mood } from "./shared/Her";
import type { V3Layout } from "./layout";
import { athenaSectionsCopy } from "@/i18n/pending/athenaSections";

/**
 * The two numbers the field adds up to. Hers climbs into the hundreds as the
 * volume rises; yours grows only by what is over the line - and names the
 * pieces of it that matter most. The numbers are the data and the animation
 * at once: watch one race while the other barely moves.
 */
export default function Tallies({
  done,
  yours,
  named,
  mood,
  g,
  f,
  reduced,
}: {
  done: number;
  yours: number;
  named: number[];
  mood: Mood;
  g: V3Layout;
  f: Frame;
  reduced: boolean;
}) {
  const c = athenaSectionsCopy.workshop.v3;
  const { her, you } = g;
  const label = "absolute whitespace-nowrap font-mono uppercase tracking-[0.16em]";
  const count = "absolute font-semibold leading-none tabular-nums";
  const shown = named.slice(0, 3);
  const rest = yours - shown.length;
  const panel = (b: { x: number; y: number; w: number; h: number }, key: "cyan" | "purple") => ({
    ...f.box(b.x, b.y, b.w, b.h),
    borderColor: tint(key, 26),
    boxShadow: `inset 0 1px 0 ${tint(key, 22)}, 0 24px 60px -30px ${tint(key, 40)}`,
  });

  return (
    <>
      <div className="absolute rounded-2xl border bg-surface/70 backdrop-blur-md" style={panel(her.panel, "cyan")} />
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={f.at(her.face.x, her.face.y)} aria-hidden="true">
        <Her size={f.len(her.face.size, 48)} mood={mood} reduced={reduced} />
      </div>
      <span className={`${label} text-muted-dark`} style={{ ...f.box(her.label.x, her.label.y), ...f.fs(14, 12) }}>
        {c.done}
      </span>
      <span className={`${count} text-brand-cyan`} style={{ ...f.box(her.count.x, her.count.y), ...f.fs(64, 34) }}>
        {done}
      </span>

      <div className="absolute rounded-2xl border bg-surface/70 backdrop-blur-md" style={panel(you.panel, "purple")} />
      <span className={`${label} flex items-center text-muted-dark`} style={{ ...f.box(you.label.x, you.label.y), ...f.fs(14, 12), gap: f.len(8, 6) }}>
        <UserRound style={{ width: f.len(16, 13), height: f.len(16, 13), color: BRAND_VAR.purple }} aria-hidden="true" />
        {c.forYou}
      </span>
      <span className={count} style={{ ...f.box(you.count.x, you.count.y), ...f.fs(64, 34), color: BRAND_VAR.purple }}>
        {yours}
      </span>

      <div className="absolute flex flex-col" style={{ ...f.box(you.list.x, you.list.y, you.list.w, you.list.h), gap: f.len(10, 6) }}>
        <AnimatePresence initial={false}>
          {shown.map((n) => (
            <motion.span
              key={n}
              layout={!reduced}
              className="flex shrink-0 items-center whitespace-nowrap rounded-xl border leading-none text-foreground"
              style={{
                height: f.len(you.row - 10, 34),
                paddingInline: f.len(14, 10),
                gap: f.len(10, 6),
                borderColor: tint("purple", 45),
                backgroundColor: tint("purple", 8),
                ...f.fs(18, 16),
              }}
              initial={reduced ? false : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 14 }}
              transition={{ duration: reduced ? 0 : 0.4 }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: BRAND_VAR.purple }} aria-hidden="true" />
              {c.items[n]}
            </motion.span>
          ))}
        </AnimatePresence>
        {rest > 0 && (
          <span className="font-mono text-muted-dark" style={f.fs(15, 12)}>
            {c.more.replace("{n}", String(rest))}
          </span>
        )}
      </div>
    </>
  );
}

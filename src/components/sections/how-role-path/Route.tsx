"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { EASE_CURVE } from "@/lib/animations";
import Stop from "./Stop";
import { roleDef, type ViewerRole } from "./roles";
import { useBoxSize } from "./useBoxSize";
import { howSectionsCopy } from "@/i18n/pending/howSections";

/* The route on the stage is a snake through a 2x2 of stations: stop 1 and 2
 * along the top, a U-turn at the right edge, stop 3 and 4 back along the
 * middle. Each station's node sits on the line at its cell's top-left corner
 * and its text hangs under the line, so the line never crosses copy. Drawn in
 * measured pixels (not a stretched viewBox) so the stroke, the draw-on and the
 * flowing dashes keep their true lengths. */
function snake(w: number, h: number) {
  const mid = w / 2;
  const row = h / 2;
  const turn = Math.min(row / 2, 56);
  return [
    `M -28 0 L ${mid} 0 L ${w - turn} 0`,
    `C ${w + turn * 0.35} 0 ${w + turn * 0.35} ${row} ${w - turn} ${row}`,
    `L ${mid} ${row} L 0 ${row}`,
  ].join(" ");
}

/** The visitor's path through the page: four stops, drawn in their role's
 *  colour. Switching role redraws the line and re-tells each stop. A flow runs
 *  along the line while it is on screen, in a visible tab, with motion on. */
export default function Route({ role, touched }: { role: ViewerRole; touched: boolean }) {
  const c = howSectionsCopy.rolePath;
  const def = roleDef(role);
  const still = useStillMotion();
  const ref = useRef<HTMLDivElement>(null);
  const flow = useIsVisible(ref) && !still;
  const { w, h } = useBoxSize(ref);
  const d = w > 0 && h > 0 ? snake(w, h) : "";
  const accent = BRAND_VAR[def.brand];

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <p className="mb-6 font-mono text-sm uppercase tracking-[0.2em] text-muted stage:mb-[clamp(1.75rem,5cqh,2.75rem)]">
        {c.routeLabel}
      </p>
      <div ref={ref} className="relative min-h-0 flex-1 stage:ml-6 stage:mr-[clamp(0.5rem,2cqw,2rem)]">
        {d && (
          <svg aria-hidden width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="pointer-events-none absolute inset-0 hidden overflow-visible stage:block">
            <path d={d} fill="none" stroke="var(--border-glass-hover)" strokeWidth="2" />
            <motion.g
              key={role}
              initial={still ? false : { opacity: 0.2 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: still ? 0 : 0.4 }}
            >
              <motion.path
                d={d}
                fill="none"
                stroke={tint(def.brand, 35)}
                strokeWidth="12"
                strokeLinecap="round"
                style={{ filter: "blur(7px)" }}
                initial={still ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={still ? { duration: 0 } : { duration: 1.6, ease: EASE_CURVE }}
              />
              <motion.path
                d={d}
                fill="none"
                stroke={accent}
                strokeWidth="3"
                strokeLinecap="round"
                initial={still ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={still ? { duration: 0 } : { duration: 1.6, ease: EASE_CURVE }}
              />
            </motion.g>
            <motion.path
              d={d}
              fill="none"
              stroke="var(--background)"
              strokeOpacity="0.9"
              strokeWidth="1.5"
              strokeDasharray="3 15"
              animate={flow ? { strokeDashoffset: [0, -36] } : { strokeDashoffset: 0 }}
              transition={flow ? { duration: 1.6, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            />
            <circle cx={-28} cy={0} r={5} fill={accent} />
          </svg>
        )}
        <ol
          aria-label={c.routeLabel}
          className="relative ml-4 flex flex-col gap-8 border-l border-glass-hover stage:ml-0 stage:grid stage:h-full stage:grid-cols-2 stage:grid-rows-2 stage:gap-0 stage:border-l-0"
        >
          {c.stops.map((s, i) => (
            <Stop key={s.title} index={i} role={def} animateIn={touched && !still} />
          ))}
        </ol>
      </div>
    </div>
  );
}

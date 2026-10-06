"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { CALLOUTS } from "./geometry";

/** Label type grows with the stage (cqw of the hero's size container), never below the text-base floor. */
const SCALE = "stage:text-[clamp(1rem,1.05cqw,1.25rem)]";
/** The lit label steps up from the dim annotation voice to full foreground / full cyan. */
const LABEL_ON = ANNOTATION_DIM.replace("text-muted-dark", "text-foreground");
const FACT_ON = ANNOTATION.replace("text-brand-cyan/80", "text-brand-cyan");

/**
 * The blueprint leaders (SVG, stage space). They draw in once on arrival; the
 * lit one brightens and a bead of light runs from the disc out to its label -
 * the benefit leaving her and reaching you.
 */
export function Leaders({ active, live, reduced }: { active: number | null; live: boolean; reduced: boolean }) {
  return (
    <g>
      {CALLOUTS.map((g, i) => {
        const on = active === i;
        const [p1, p2, p3] = g.points;
        const run = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const total = run + Math.abs(p3.x - p2.x);
        const t1 = Number(((run / total) * 0.8).toFixed(3));
        return (
          <g key={g.id}>
            <motion.path
              d={g.path} fill="none"
              stroke={tint("cyan", on ? 90 : 34)} strokeWidth={on ? 1.75 : 1}
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 + i * 0.16 }}
              style={{ transition: "stroke 0.5s, stroke-width 0.5s" }}
            />
            <circle cx={p1.x} cy={p1.y} r={on ? 4.5 : 3} fill={BRAND_VAR.cyan} opacity={on ? 1 : 0.6} />
            {on && live && (
              <motion.circle
                cx={0} cy={0} r={4.5} fill={BRAND_VAR.cyan}
                initial={{ x: p1.x, y: p1.y, opacity: 0 }}
                animate={{ x: [p1.x, p2.x, p3.x, p3.x], y: [p1.y, p2.y, p3.y, p3.y], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.6, times: [0, t1, 0.8, 1], ease: "linear", repeat: Infinity, repeatDelay: 0.9 }}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * The labels (HTML over the stage, lg and up). Each is a real button: hover or
 * focus pins its callout so the being acts it out for as long as you look.
 */
export function Labels({
  active, reduced, onPin,
}: {
  active: number | null;
  reduced: boolean;
  onPin: (i: number | null) => void;
}) {
  const { t } = useTranslation();
  const callouts = t.athenaPage.hero.callouts;

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      {CALLOUTS.map((g, i) => {
        const on = active === i;
        return (
          <motion.button
            key={g.id}
            type="button"
            aria-pressed={on}
            onPointerEnter={() => onPin(i)}
            onPointerLeave={() => onPin(null)}
            onFocus={() => onPin(i)}
            onBlur={() => onPin(null)}
            className={`pointer-events-auto absolute -translate-y-1/2 cursor-default rounded-md px-2 py-1 break-words focus-visible:outline-2 focus-visible:outline-brand-cyan ${g.left ? "text-right" : "text-left"}`}
            style={g.labelStyle}
            initial={reduced ? false : { opacity: 0, scale: 0.85, rotate: g.left ? -3 : 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ ...SPRING_POP, delay: 0.72 + i * 0.16 }}
          >
            <span className={`block transition-colors duration-500 ${on ? LABEL_ON : ANNOTATION_DIM} ${SCALE}`}>
              {callouts[i].label}
            </span>
            <span className={`mt-1 block normal-case tracking-normal transition-colors duration-500 ${on ? FACT_ON : ANNOTATION} ${SCALE}`}>
              {callouts[i].fact}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/** Below lg: the same four promises as tick-marked rows under the being. */
export function CalloutList({ active, reduced }: { active: number | null; reduced: boolean }) {
  const { t } = useTranslation();
  const c = t.athenaPage.hero;

  return (
    <ul aria-label={c.calloutsAria} className="mx-auto mt-6 grid w-full max-w-md grid-cols-1 gap-4 px-2 lg:hidden">
      {c.callouts.map((item, i) => (
        <motion.li
          key={CALLOUTS[i].id}
          className="flex items-start gap-3"
          initial={reduced ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING_POP, delay: 0.3 + i * 0.12 }}
        >
          <span
            aria-hidden="true"
            className="mt-3 h-px w-5 shrink-0 transition-colors duration-500"
            style={{ background: active === i ? BRAND_VAR.cyan : tint("cyan", 40) }}
          />
          <span className="min-w-0 break-words">
            <span className={`block ${active === i ? LABEL_ON : ANNOTATION_DIM}`}>{item.label}</span>
            <span className={`mt-1 block ${ANNOTATION} normal-case tracking-normal`}>{item.fact}</span>
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

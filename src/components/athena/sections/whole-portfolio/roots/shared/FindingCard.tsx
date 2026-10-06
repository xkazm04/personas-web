"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage, stepDelay, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";

/**
 * What the project turns out to be once she is down there with it - the
 * payoff every "Nothing quietly rots" direction ends on, in the live
 * section's translated words: the project, the dimensions that are not fine
 * and since when, the one specific finding, and the fix (offered, then taken).
 *
 * It composes in the shared stage layers (shell -> body -> detail -> chosen)
 * rather than arriving as a card. One box is mounted the whole time it is
 * open, so nothing re-flows while it fills. Type is sized from the art's
 * slot (`cqh`), so it is the dominant reading in the frame at every size.
 */

const NAME = "text-[clamp(1.25rem,4cqh,2.125rem)]";
const READ = "text-[clamp(1rem,2.5cqh,1.375rem)]";

function Part({ show, i = 0, reduced, className = "", style, children }: {
  show: boolean;
  i?: number;
  reduced: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (!show) return null;
  return (
    <motion.span
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: stepDelay(i) }}
    >
      {children}
    </motion.span>
  );
}

export default function FindingCard({
  stage,
  beckon,
  live,
  reduced,
  className = "",
  style,
}: {
  stage: ModuleStage;
  beckon: boolean;
  live: boolean;
  reduced: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const { t } = useTranslation();
  const p = t.athenaPage.portfolio;
  const c = p.panel;
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const done = atStage(stage, "chosen");
  const key = done ? "emerald" : "rose";

  return (
    <div
      className={`flex flex-col gap-[clamp(0.375rem,1.3cqh,0.875rem)] overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur-md sm:px-[clamp(1.25rem,2.8cqh,2rem)] sm:py-[clamp(0.75rem,2.2cqh,1.5rem)] ${className}`}
      style={{
        ...style,
        borderColor: tint(key, 45),
        backgroundColor: "color-mix(in srgb, var(--background) 74%, transparent)",
        boxShadow: brandShadow(key, 40, 18),
        transition: reduced ? undefined : "border-color 0.5s, box-shadow 0.5s",
      }}
      aria-hidden="true"
    >
      <span className="flex items-center gap-2">
        <Part show i={0} reduced={reduced} className={`min-w-0 flex-1 truncate font-semibold tracking-tight text-foreground ${NAME}`}>
          {p.projects[7]}
        </Part>
        <Part
          show
          i={1}
          reduced={reduced}
          className={`shrink-0 rounded-full border px-2.5 py-0.5 ${READ}`}
          style={{ borderColor: tint("rose", 40), color: BRAND_VAR.rose }}
        >
          {c.badge}
        </Part>
      </span>

      {c.rows.map((row, i) => (
        <Part key={row.name} show={body} i={i} reduced={reduced} className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.rose, boxShadow: brandShadow("rose", 6, 70) }}
          />
          <span className={`min-w-0 truncate text-foreground ${READ}`}>{row.name}</span>
          <span className={`ml-auto shrink-0 normal-case ${ANNOTATION_DIM}`}>{row.since}</span>
        </Part>
      ))}

      <Part
        show={detail}
        reduced={reduced}
        className={`rounded-r-lg border-l-2 py-1 pl-2.5 pr-1 leading-snug text-foreground ${READ}`}
        style={{ borderColor: BRAND_VAR.rose, backgroundColor: tint("rose", 6) }}
      >
        <span className="hidden sm:inline">{c.finding}</span>
        <span className="sm:hidden">{c.findingShort}</span>
      </Part>

      <span className="flex items-center gap-2">
        <Part show={detail} reduced={reduced} className={`min-w-0 truncate text-muted-dark ${READ}`}>
          {c.rest}
        </Part>
        {(beckon || done) && (
          <motion.span
            className={`ml-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-0.5 ${READ}`}
            style={{
              borderColor: tint(done ? "emerald" : "cyan", 55),
              backgroundColor: tint(done ? "emerald" : "cyan", done ? 12 : 16),
              color: BRAND_VAR[done ? "emerald" : "cyan"],
              boxShadow: done ? undefined : brandShadow("cyan", 18, 30),
            }}
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={live && !done ? { opacity: 1, y: 0, scale: [1, 1.045, 1] } : { opacity: 1, y: 0, scale: 1 }}
            transition={
              live && !done
                ? { scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" }, duration: 0.3 }
                : { duration: reduced ? 0 : 0.25 }
            }
          >
            {done && <Check reduced={reduced} />}
            <span className="hidden sm:inline">{done ? c.done : c.action}</span>
            <span className="sm:hidden">{done ? c.done : c.actionShort}</span>
          </motion.span>
        )}
      </span>
    </div>
  );
}

/** A check that draws itself - the mark of something attended to. */
export function Check({ reduced, className = "h-4 w-4" }: { reduced: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path
        d="M5 12.5 10 17.5 19 7"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 0.12, ease: "easeOut" }}
      />
    </svg>
  );
}

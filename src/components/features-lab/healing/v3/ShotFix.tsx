"use client";

import { motion } from "framer-motion";
import { Bookmark, Check, LockKeyhole } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fill, type CaseId } from "../shared/cases";
import { FAILING_STEP } from "./data";
import type { HealingCopy } from "./ShotsA";

/**
 * Shot 3: the fix this error needs, drawn as its own instrument: a countdown
 * (rate limit), a doubled time limit (timeout), a bookmark the run resumes
 * from (overload), a lock no retry opens (login). `live` = in focus and
 * motion allowed; otherwise the instrument rests at its finished state.
 */
export default function ShotFix({ t, caseId, live }: { t: HealingCopy; caseId: CaseId; live: boolean }) {
  const c = t.cases[caseId];
  const login = caseId === "login";
  const k: BrandKey = login ? "rose" : "cyan";
  return (
    <div className="flex h-full items-center gap-[1.3em]">
      <div className="flex h-[8.5em] w-[8.5em] shrink-0 items-center justify-center rounded-[1em] border" style={{ borderColor: tint(k, 40), background: tint(k, 8) }}>
        <Instrument key={String(live)} t={t} caseId={caseId} live={live} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[0.4em]">
        <span className="font-mono text-[0.8em] font-semibold uppercase tracking-[0.14em]" style={{ color: BRAND_VAR[k] }}>
          {login ? t.v3.noBlindRetries : t.stages.fix}
        </span>
        <span className="text-[1.3em] font-semibold leading-tight text-foreground">{c.fix}</span>
        {!login && <span className="text-[0.9em] text-foreground/75">{fill(t.retry, 1)}</span>}
        {caseId === "rateLimit" && (
          <span className="mt-[0.2em] flex flex-wrap items-center gap-[0.4em] text-[0.85em] text-foreground/75">
            {t.v3.backoff}
            {[60, 120].map((n) => (
              <span key={n} className="rounded-full border border-glass px-[0.6em] font-semibold tabular-nums text-foreground">
                {fill(t.v3.secs, n)}
              </span>
            ))}
          </span>
        )}
        {caseId === "overload" && <span className="text-[0.9em] text-foreground/75">{fill(t.v3.resumeAt, FAILING_STEP.overload + 1)}</span>}
      </div>
    </div>
  );
}

function Instrument({ t, caseId, live }: { t: HealingCopy; caseId: CaseId; live: boolean }) {
  if (caseId === "rateLimit")
    return (
      <div className="relative h-[6.5em] w-[6.5em]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--foreground)" strokeOpacity={0.12} strokeWidth="7" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={BRAND_VAR.amber}
            strokeWidth="7"
            strokeLinecap="round"
            initial={{ pathLength: live ? 1 : 0.02 }}
            animate={{ pathLength: 0.02 }}
            transition={{ duration: live ? 3 : 0, ease: "linear" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[1.3em] font-bold tabular-nums text-foreground">{fill(t.v3.secs, 30)}</span>
      </div>
    );
  if (caseId === "timeout")
    return (
      <div className="flex w-[6.8em] flex-col gap-[0.5em]">
        <span className="font-mono text-[0.8em] uppercase tracking-wider text-foreground/70">{t.v3.timeLimit}</span>
        <Bar label="1×" width="45%" fillTo={1} color="rose" live={false} />
        <Bar label="2×" width="100%" fillTo={0.68} color="cyan" live={live} done />
      </div>
    );
  if (caseId === "overload")
    return (
      <div className="flex flex-col items-center gap-[0.5em]">
        <span className="rounded-full px-[0.6em] text-[0.95em] font-semibold" style={{ color: BRAND_VAR.purple, background: tint("purple", 16) }}>
          {fill(t.v3.mins, 10)}
        </span>
        <div className="flex items-center gap-[0.35em]">
          {[0, 1, 2, 3].map((i) =>
            i === FAILING_STEP.overload ? (
              <motion.span key={i} initial={{ y: 0 }} animate={live ? { y: [0, -4, 0] } : { y: 0 }} transition={live ? { duration: 1.2, repeat: Infinity } : { duration: 0 }}>
                <Bookmark className="h-[1.5em] w-[1.5em]" fill={BRAND_VAR.purple} style={{ color: BRAND_VAR.purple }} aria-hidden />
              </motion.span>
            ) : (
              <span key={i} className="h-[0.75em] w-[0.75em] rounded-full" style={{ background: i < FAILING_STEP.overload ? BRAND_VAR.emerald : "color-mix(in srgb, var(--foreground) 25%, transparent)" }} />
            ),
          )}
        </div>
      </div>
    );
  return (
    <span className="flex h-[5em] w-[5em] items-center justify-center rounded-full border-2" style={{ borderColor: BRAND_VAR.rose, boxShadow: `0 0 1.6em ${tint("rose", 35)}` }}>
      <LockKeyhole className="h-[2.4em] w-[2.4em]" style={{ color: BRAND_VAR.rose }} aria-hidden />
    </span>
  );
}

function Bar({ label, width, fillTo, color, live, done }: { label: string; width: string; fillTo: number; color: BrandKey; live: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-[0.4em]">
      <span className="w-[1.6em] font-mono text-[0.8em] text-foreground/75">{label}</span>
      <div className="relative h-[0.7em] flex-1">
        <div className="relative h-full overflow-hidden rounded-full bg-foreground/10" style={{ width }}>
          <motion.div
            className="absolute inset-y-0 left-0 origin-left rounded-full"
            style={{ background: BRAND_VAR[color], width: "100%" }}
            initial={{ scaleX: live ? 0 : fillTo }}
            animate={{ scaleX: fillTo }}
            transition={{ duration: live ? 2.2 : 0, ease: "easeOut" }}
          />
        </div>
      </div>
      {done && <Check className="h-[1em] w-[1em]" strokeWidth={3} style={{ color: BRAND_VAR.emerald }} aria-hidden />}
    </div>
  );
}

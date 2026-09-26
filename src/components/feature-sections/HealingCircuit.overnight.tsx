"use client";

import { UserRound } from "lucide-react";
import { motion, useTransform } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import HealingShell, { Fade, Grow, useOncePlay } from "./HealingCircuit.shell";
import { AXIS_SLOTS, FAILS, HANDOFF, Pill, RUNS, SWEEP, Retry, slotX, sweepAt } from "./HealingCircuit.overnight.parts";

/*
 * /illustrate r3 variant "overnight" (data-as-art): one night of scheduled runs,
 * every 30 minutes from 00:00. Three fail for reasons a retry fixes, and each
 * bounces back (a green retry above it, tagged with its fix from
 * core/src/healing.rs); one fails on a rejected credential, which no retry fixes, and
 * rides a line to the 07:00 Health Issues card.
 *
 * Beats on p (0 -> 1): the night's schedule is drawn from the start (neutral pills); a
 * "now" line sweeps 00:00 -> 06:00 over 0-SWEEP and colours each run as it passes; a failure's retry and tag follow 0.04-0.10 later; the 401's
 * line grows to the card, whose row lands in its empty slot over 0.78-0.90.
 */

const WORDS = {
  heading: "Fixes itself when things",
  headingGradient: "break",
  lede: "Scheduled runs fail at night for ordinary reasons. Personas retries each one with the fix for its error, so by morning only the problem that needs you is waiting.",
  artLabel:
    "A night of scheduled runs from midnight to 6 am. A rate limit waits 30 seconds and retries, a timeout retries with double the time limit, a server error resumes in 10 minutes; all three end auto-fixed. A 401 credential error goes to the 7:00 Health Issues list, for you.",
  replay: "Replay the animation",
  hours: ["00:00", "02:00", "04:00", "06:00"],
  fixes: [
    { code: "Rate limit", fix: "wait 30s" },
    { code: "Timeout", fix: "2× limit" },
    { code: "Server error", fix: "resume in 10m" },
  ],
  code401: "401",
  morning: "07:00",
  issuesTitle: "Health Issues",
  noIssues: "No open issues",
  issueOpen: "Credential / auth error",
  forYou: "for you",
  completed: "completed",
  autoFixed: "auto-fixed",
  failed: "failed",
} as const;

const DURATION = 3.4;

export default function HealingCircuitOvernight() {
  const { ref, p, replay, still } = useOncePlay(DURATION);
  const w = WORDS;
  const nowX = useTransform(p, [0, SWEEP], ["0%", "100%"]);
  const nowOpacity = useTransform(p, [0, 0.02, SWEEP, SWEEP + 0.05], [0, 0.7, 0.7, 0]);
  const hx = slotX(HANDOFF);
  // The app's empty state holds the slot until 05:30's failure lands; removed (not just
  // faded) once it does, so the finished picture and the server render never carry it.
  const emptyDisplay = useTransform(p, (v) => (v < 0.78 ? "flex" : "none"));

  return (
    <HealingShell words={w} emTall={15} maxEm={52} artRef={ref} onReplay={replay} still={still} phoneButtonRow={false}>
      <div className="grid items-center gap-[1.4em] md:grid-cols-[1fr_14em]">
        {/* The night strip */}
        <div className="relative h-[8.7em]">
          {/* now line */}
          <motion.div className="absolute inset-y-0 left-0 right-0" style={{ x: nowX, opacity: nowOpacity }} aria-hidden>
            <div className="h-full w-[2px] rounded-full" style={{ background: BRAND_VAR.cyan }} />
          </motion.div>

          {/* axis */}
          <div className="absolute inset-x-0 top-[6.85em] h-px bg-foreground/20" />
          {AXIS_SLOTS.map((slot, i) => (
            <span key={slot} className="absolute top-[7.2em] -translate-x-1/2" style={{ left: `${slotX(slot)}%` }}>
              <span className="font-mono text-[0.8em] text-foreground/60 md:text-[0.72em]">{w.hours[i]}</span>
            </span>
          ))}

          {RUNS.map((r) => (
            <Pill key={r.slot} p={p} slot={r.slot} kind={r.kind} />
          ))}
          {FAILS.map((slot, i) => (
            <Retry key={slot} p={p} slot={slot} code={w.fixes[i].code} fix={w.fixes[i].fix} />
          ))}

          {/* the one a retry can't fix: a line out to the morning */}
          <Fade
            p={p}
            a={sweepAt(HANDOFF)}
            b={sweepAt(HANDOFF) + 0.04}
            className="absolute top-[3.45em] -translate-x-1/2"
            style={{ left: `${hx}%`, color: BRAND_VAR.rose }}
          >
            <span className="font-mono text-[0.8em] font-semibold md:text-[0.72em]">{w.code401}</span>
          </Fade>
          <Grow
            p={p}
            a={sweepAt(HANDOFF) + 0.04}
            b={0.78}
            className="absolute right-0 top-[5.55em] border-t-2 border-dashed md:right-[-1.4em]"
            style={{ left: `${hx + 2}%`, borderColor: BRAND_VAR.rose }}
          />
        </div>

        {/* 07:00: what is waiting for you */}
        <div className="rounded-[0.8em] border border-glass bg-white/[0.03] p-[0.9em]">
          <div className="flex items-baseline justify-between gap-[0.6em]">
            <span className="font-semibold text-foreground/90">{w.issuesTitle}</span>
            <span className="font-mono text-[0.8em] text-foreground/60">{w.morning}</span>
          </div>
          {/* the slot the issue lands in: the list's empty state until 05:30's run arrives */}
          <div className="relative mt-[0.6em] rounded-[0.6em] border border-dashed border-glass">
            {/* phones only: there the stacked card is otherwise a blank box mid-play */}
            <div className="md:hidden">
              <motion.div
                className="absolute inset-0 items-center justify-center text-[0.85em] text-foreground/60"
                style={{ display: emptyDisplay }}
              >
                {w.noIssues}
              </motion.div>
            </div>
            <Fade
              p={p}
              a={0.78}
              b={0.9}
              rise={0.4}
              className="-m-px flex flex-col gap-[0.4em] rounded-[0.6em] border p-[0.65em]"
              style={{ borderColor: tint("rose", 40), background: tint("rose", 8) }}
            >
              <span className="text-[0.9em] font-medium text-foreground/90">{w.issueOpen}</span>
              <span className="inline-flex items-center gap-[0.3em] text-[0.85em] font-semibold" style={{ color: BRAND_VAR.rose }}>
                <UserRound className="h-[1.05em] w-[1.05em]" aria-hidden />
                {w.forYou}
              </span>
            </Fade>
          </div>
        </div>
      </div>

      {/* key */}
      <div className="mt-[0.9em] flex flex-wrap items-center justify-center gap-x-[1.6em] gap-y-1 border-t border-glass pt-[0.8em] text-[0.8em] text-foreground/70">
        <Key color={tint("emerald", 55)} label={w.completed} />
        <Key color={BRAND_VAR.emerald} ring label={w.autoFixed} />
        <Key color={tint("rose", 75)} label={w.failed} />
      </div>
    </HealingShell>
  );
}

function Key({ color, label, ring }: { color: string; label: string; ring?: boolean }) {
  return (
    <span className="inline-flex items-center gap-[0.45em]">
      <span
        className="inline-block h-[0.9em] w-[1.5em] rounded-full"
        style={{ background: color, boxShadow: ring ? `0 0 0 2px ${tint("emerald", 35)}` : undefined }}
      />
      {label}
    </span>
  );
}

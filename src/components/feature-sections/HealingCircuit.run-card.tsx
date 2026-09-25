"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Clock, Mail, RotateCw, ShieldAlert, UserRound } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import HealingShell, { Fade, Grow, useOncePlay } from "./HealingCircuit.shell";

/*
 * /illustrate r3 variant "run-card" (product-true, real content reduced): the
 * desktop app's runner with its inline HealingCard (runner/HealingCard.tsx: title,
 * strategy "Exponential backoff", "Retrying in {seconds}s...", "Attempt {n} of {max}")
 * and the Health Issues list (issueModel.ts states; en.json "auto-fixed").
 *
 * Beats on p (0 -> 1): 0.00-0.16 the phase bar fills · 0.14-0.20 the 429 · 0.22-0.34 the
 * HealingCard rises · 0.36-0.72 its countdown fills · 0.74-0.84 the retry completes
 * · 0.86-0.96 the healed issue lands in Health Issues as auto-fixed.
 */

const WORDS = {
  heading: "Fixes itself when things",
  headingGradient: "break",
  lede: "This is a failed run in the app: Personas names the error, counts down and retries on its own. Health Issues keeps the record, and only what it can't retry stays open for you.",
  artLabel:
    "The Personas app: the Inbox Triage run hits a 429 rate limit, a healing card retries it with exponential backoff in 30 seconds, attempt 1 of 3, and the retry completes. In Health Issues the rate limit is marked auto-fixed and a credential error stays open for you.",
  replay: "Replay the animation",
  persona: "Inbox Triage",
  error: "429 rate_limit_error",
  cardTitle: "Rate limit hit",
  strategy: "Exponential backoff",
  retryingIn: "Retrying in 30s…",
  attempt: "Attempt 1 of 3",
  completed: "completed",
  healingRetry: "Healing retry #1",
  issuesTitle: "Health Issues",
  issueFixed: "Rate limit hit",
  autoFixed: "auto-fixed",
  issueOpen: "Credential / auth error",
  high: "high",
  forYou: "for you",
} as const;

const DURATION = 4.6;

function Chip({ tone, children, mono }: { tone: BrandKey; children: ReactNode; mono?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.3em] whitespace-nowrap rounded-[0.4em] px-[0.45em] py-[0.1em] text-[0.8em] font-semibold ${mono ? "font-mono" : ""}`}
      style={{ color: BRAND_VAR[tone], background: tint(tone, 12), border: `1px solid ${tint(tone, 30)}` }}
    >
      {children}
    </span>
  );
}

const panel = "rounded-[0.8em] border border-glass bg-white/[0.03] p-[1.2em] md:p-[0.9em]";
const fixedRow = "flex items-center gap-[0.5em] rounded-[0.6em] border border-glass p-[0.7em] text-foreground/70";

/** A settled issue: hollow emerald glyph (issueModel "fixed"), muted row. */
function FixedRow({ title, badge }: { title: string; badge: string }) {
  return (
    <>
      <span className="h-[0.6em] w-[0.6em] shrink-0 rounded-full border-2" style={{ borderColor: BRAND_VAR.emerald }} />
      <span className="font-medium">{title}</span>
      <span className="ml-auto">
        <Chip tone="emerald">{badge}</Chip>
      </span>
    </>
  );
}

export default function HealingCircuitRunCard() {
  const { ref, p, replay, still } = useOncePlay(DURATION);
  const w = WORDS;
  return (
    <HealingShell words={w} emTall={22} maxEm={50} artRef={ref} onReplay={replay} still={still}>
      <div className="grid gap-[1.1em] md:grid-cols-[1.45fr_1fr]">
        {/* The runner: one run, its log, and the healing card under it */}
        <div className={`${panel} flex flex-col gap-[0.7em]`}>
          <div className="flex items-center gap-[0.6em]">
            <span className="flex h-[1.9em] w-[1.9em] items-center justify-center rounded-[0.5em]" style={{ background: tint("cyan", 16), color: BRAND_VAR.cyan }}>
              <Mail className="h-[1.05em] w-[1.05em]" aria-hidden />
            </span>
            <span className="font-semibold text-foreground/90">{w.persona}</span>
          </div>

          <div className="flex flex-col gap-[0.5em] rounded-[0.6em] bg-foreground/[0.05] px-[0.8em] py-[0.6em]">
            {/* the run's phase bar (RunnerPhaseTimeline): two phases done, the third ends in the error */}
            <div className="flex h-[0.9em] gap-[2px] overflow-hidden rounded-[0.3em]">
              <Grow p={p} a={0} b={0.05} className="h-full flex-[3] bg-foreground/20" />
              <Grow p={p} a={0.05} b={0.1} className="h-full flex-[5] bg-foreground/20" />
              <Grow p={p} a={0.1} b={0.16} className="h-full flex-[2]" style={{ background: tint("rose", 45) }} />
            </div>
            <Fade p={p} a={0.14} b={0.2} className="font-mono text-[0.8em]" style={{ color: BRAND_VAR.rose }}>
              ✕ {w.error}
            </Fade>
          </div>

          <Fade
            p={p}
            a={0.22}
            b={0.34}
            rise={0.6}
            className="flex flex-col gap-[0.45em] rounded-[0.7em] border p-[0.75em]"
            style={{ borderColor: tint("amber", 35), background: tint("amber", 6) }}
          >
            <div className="flex items-center gap-[0.5em] font-semibold" style={{ color: BRAND_VAR.amber }}>
              <ShieldAlert className="h-[1.1em] w-[1.1em]" aria-hidden />
              {w.cardTitle}
            </div>
            <div className="flex items-center gap-[0.5em] text-[0.85em] text-foreground/80">
              <RotateCw className="h-[1em] w-[1em]" style={{ color: BRAND_VAR.amber }} aria-hidden />
              {w.strategy}
            </div>
            <div className="flex items-center gap-[0.5em]">
              <Clock className="h-[0.95em] w-[0.95em]" style={{ color: BRAND_VAR.amber }} aria-hidden />
              <span className="font-mono text-[0.8em]" style={{ color: BRAND_VAR.amber }}>{w.retryingIn}</span>
              <span className="ml-auto rounded-[0.4em] border border-glass bg-foreground/[0.05] px-[0.45em] font-mono text-[0.8em] text-foreground/85">
                {w.attempt}
              </span>
            </div>
            <div className="h-[0.3em] overflow-hidden rounded-full bg-foreground/10">
              <Grow p={p} a={0.36} b={0.72} className="h-full w-full rounded-full" style={{ background: tint("amber", 70) }} />
            </div>
          </Fade>

          <Fade p={p} a={0.74} b={0.84} rise={0.4} className="flex items-center gap-[0.55em]">
            <CheckCircle2 className="h-[1.15em] w-[1.15em]" style={{ color: BRAND_VAR.emerald }} aria-hidden />
            <span className="font-semibold" style={{ color: BRAND_VAR.emerald }}>{w.completed}</span>
            <Chip tone="cyan" mono>
              <RotateCw className="h-[1em] w-[1em]" aria-hidden />
              {w.healingRetry}
            </Chip>
          </Fade>
        </div>

        {/* Health Issues: the fixed one recedes, the open one waits for you */}
        <div className={`${panel} flex flex-col gap-[0.6em]`}>
          <div className="font-semibold text-foreground/90">{w.issuesTitle}</div>
          <div
            className="flex flex-col gap-[0.5em] rounded-[0.6em] border p-[0.7em]"
            style={{ borderColor: tint("rose", 40), background: tint("rose", 7) }}
          >
            <div className="flex items-center gap-[0.5em]">
              <span className="h-[0.6em] w-[0.6em] shrink-0 rounded-full" style={{ background: BRAND_VAR.amber }} />
              <span className="font-medium text-foreground/90">{w.issueOpen}</span>
            </div>
            <div className="flex items-center gap-[0.5em]">
              <Chip tone="amber">{w.high}</Chip>
              <span className="ml-auto inline-flex items-center gap-[0.3em] text-[0.85em] font-semibold" style={{ color: BRAND_VAR.rose }}>
                <UserRound className="h-[1.05em] w-[1.05em]" aria-hidden />
                {w.forYou}
              </span>
            </div>
          </div>
          <Fade p={p} a={0.86} b={0.96} rise={0.5} className={fixedRow}>
            <FixedRow title={w.issueFixed} badge={w.autoFixed} />
          </Fade>

        </div>
      </div>
    </HealingShell>
  );
}

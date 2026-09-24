"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { COLS, FRAMES, FULL_STEP, PERSONA_NAME, ROWS, SENTENCE, mix } from "./CommandCenterIllustration.contact-sheet.data";
import ContactSheetFrame from "./CommandCenterIllustration.contact-sheet.frame";
import ContactSheetSigil from "./CommandCenterIllustration.contact-sheet.sigil";

/**
 * Hero illustration, "contact sheet" direction. Claim: describe an agent in
 * plain language and it becomes a working persona, on your machine.
 *
 * The app's build flow in miniature: the typed sentence sits in the centre
 * cell, the eight frames around it (the app's eight persona dimensions) develop
 * clockwise into that persona's parts, and the persona is named last.
 *
 * Motion is one progress value (`step`, 0..FULL_STEP) advanced once by a short
 * beat list when the sheet comes into view. Server markup and reduced motion
 * both render the finished sheet (step = FULL_STEP), which still shows the
 * order through the 01..08 numbering and the lit sigil petals.
 */

const BEAT_MS = 380;
const LEAD_MS = 450;
const PAPER = "color-mix(in srgb, var(--background) 92%, transparent)";

export default function ContactSheetIllustration(_props: { publicBetaLabel: string }) {
  const still = useStillMotion();
  const rootRef = useRef<HTMLElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.5 });
  const [step, setStep] = useState(FULL_STEP);
  const [played, setPlayed] = useState(false);
  const timers = useRef<number[]>([]);

  const play = useCallback(() => {
    timers.current.forEach((h) => window.clearTimeout(h));
    timers.current = [window.setTimeout(() => setStep(0), 0)];
    for (let s = 1; s <= FULL_STEP; s++) {
      timers.current.push(window.setTimeout(() => setStep(s), LEAD_MS + (s - 1) * BEAT_MS));
    }
    timers.current.push(window.setTimeout(() => setPlayed(true), LEAD_MS + FULL_STEP * BEAT_MS));
  }, []);

  useEffect(() => {
    if (still || !inView) return;
    play();
    const pending = timers.current;
    return () => pending.forEach((h) => window.clearTimeout(h));
  }, [still, inView, play]);

  const shown = still ? FULL_STEP : step;
  const named = shown >= FULL_STEP;
  const t = still ? { duration: 0 } : { duration: 0.5, ease: "easeOut" as const };

  return (
    <figure
      ref={rootRef}
      aria-label={`A contact sheet: the sentence "${SENTENCE}" in the centre, surrounded by eight frames that describe the ${PERSONA_NAME} persona it becomes.`}
      className="mx-auto flex w-[460px] max-w-full flex-col gap-3"
    >
      <div
        className="relative grid h-[318px] gap-2.5"
        style={{ gridTemplateColumns: COLS.map((c) => `${c}fr`).join(" "), gridTemplateRows: ROWS.map((r) => `${r}fr`).join(" ") }}
      >
        <ContactSheetSigil step={shown} still={still} />

        {FRAMES.map((f, i) => (
          <ContactSheetFrame key={f.kind} f={f} n={i + 1} developed={shown > i} still={still} />
        ))}

        {/* Centre cell: the sentence, then the persona it became. */}
        <div
          className="relative flex min-h-0 flex-col justify-between rounded-lg border px-3 py-2.5"
          style={{
            gridColumn: 2,
            gridRow: 2,
            background: PAPER,
            borderColor: named ? tint("cyan", 35) : "var(--border-glass-hover)",
            boxShadow: named ? `0 0 24px ${tint("cyan", 14)}` : undefined,
            transition: "border-color 0.5s, box-shadow 0.5s",
          }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-dark">You typed</p>
          <p className="text-[13px] leading-snug text-foreground">&ldquo;{SENTENCE}&rdquo;</p>
          <motion.p
            className="flex items-center gap-1.5 text-sm font-bold text-foreground"
            initial={false}
            animate={{ opacity: named ? 1 : 0, y: named ? 0 : 4 }}
            transition={t}
          >
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: BRAND_VAR.cyan, boxShadow: `0 0 8px ${tint("cyan", 60)}` }} />
            {PERSONA_NAME}
            <span className="ml-auto rounded-md px-1.5 py-0.5 font-mono text-xs font-medium" style={{ color: BRAND_VAR.emerald, background: tint("emerald", 10) }}>
              ready
            </span>
          </motion.p>
        </div>
      </div>

      {/* Film rail: the order the frames develop in. */}
      <div className="flex items-center gap-2">
        <div aria-hidden className="flex flex-1 gap-1">
          {FRAMES.map((f, i) => (
            <span key={f.kind} className="h-1 flex-1 rounded-full" style={{ background: shown > i ? mix(f.color, 70) : "color-mix(in srgb, var(--foreground) 10%, transparent)", transition: "background 0.4s" }} />
          ))}
        </div>
        <span className="font-mono text-xs text-muted-dark">real build: 3 to 6 min</span>
        {!still && played && shown === FULL_STEP && (
          <button
            type="button"
            onClick={play}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs text-muted hover:bg-white/[0.04] hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan/60"
          >
            <RotateCcw aria-hidden className="h-3 w-3" />
            Replay
          </button>
        )}
      </div>

      <figcaption className="text-sm leading-snug text-muted">
        Describe it in one sentence. Eight frames develop into the agent it describes, and it runs on your machine.
      </figcaption>
    </figure>
  );
}

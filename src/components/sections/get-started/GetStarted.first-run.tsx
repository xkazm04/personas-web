"use client";

import { Fragment, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { ArrowRight, Check, Download, FlaskConical, Monitor, Palette, Play, Sparkles, type LucideIcon } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { GetStartedIntro, ReplayButton, usePlayOnce } from "./GetStarted.shared";
import { BODY_WORDS, DesktopThumb, RunBody, SetupThumb, TemplateThumb, Thumb } from "./GetStarted.first-run.parts";

/* /illustrate r3 variant "first-run" (product-true): the app's own first-run
 * window (OnboardingOverlay + StepIndicator), reduced, resting on the First Run
 * step. Beside it, its earlier screens shrunk to what you did there (an approved
 * desktop app, a starter template, an adoption answer). Played once: the
 * thumbnails light and the chips tick in step order, then the run streams. */

const WORDS = {
  lede: "Install Personas and it walks you through five steps in the app, ending with your first agent's first run. All you need is Claude Code signed in, no Personas account.",
  artLabel:
    "The Personas Get Started window with its five steps, all done: Look & Feel; Desktop, where Obsidian was approved; Pick Template, Email Morning Digest; Set Up Agent, email provider Gmail; and First Run, showing the agent output and Execution completed successfully.",
  replay: "Replay the animation",
  title: "Get Started",
  steps: ["Look & Feel", "Desktop", "Pick Template", "Set Up Agent", "First Run"],
} as const;

const STEP_ICONS: LucideIcon[] = [Palette, Monitor, FlaskConical, Download, Play];
/** Phases: Desktop, Pick Template, Set Up Agent, First Run running, First Run done (rest). */
const STATES = 5;
const REST = STATES - 1;
const DURATION = 4;

export default function GetStartedFirstRun() {
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlayOnce(ref, DURATION);
  const [phase, setPhase] = useState(REST);
  const [lines, setLines] = useState<number>(BODY_WORDS.lines.length);
  useMotionValueEvent(p, "change", (v) => {
    setPhase(Math.min(REST, Math.floor(v * STATES)));
    // Output lines stream in during the running state.
    setLines(Math.max(0, Math.min(BODY_WORDS.lines.length, Math.floor((v * STATES - 3) * 2.6))));
  });

  // Chip i is the step on screen; the chips before it are done. At rest every chip is done.
  const rest = phase === REST;
  const current = rest ? -1 : phase + 1;
  const done = (i: number) => rest || i < current;
  const thumbs = [DesktopThumb, TemplateThumb, SetupThumb];

  return (
    <SectionWrapper fit="fill" aria-labelledby="get-started-heading">
      <GetStartedIntro lede={WORDS.lede} />
      <div data-stage-slot className="flex flex-col justify-center">
        <div
          ref={ref}
          data-stage-zoom
          data-illustrate-art
          role="img"
          aria-label={WORDS.artLabel}
          className="mx-auto mt-8 grid w-full max-w-[1040px] items-center gap-8 md:grid-cols-[272px_1fr] md:gap-4"
        >
          {/* The window's earlier screens, shrunk to what you did there */}
          <div className="relative space-y-4 pl-3 md:space-y-2.5">
            <span className="absolute bottom-6 left-0 top-6 border-l border-dashed" style={{ borderColor: tint("emerald", 40) }} aria-hidden />
            {thumbs.map((Body, k) => (
              <Thumb key={k} n={k + 2} lit={rest || k <= phase}>
                <Body />
              </Thumb>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-glass-hover bg-background shadow-2xl">
            {/* Header, as the app's onboarding modal draws it */}
            <div className="flex items-center gap-3 border-b border-glass px-5 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border" style={{ backgroundColor: tint("purple", 15), borderColor: tint("purple", 30) }}>
                <Sparkles className="h-[18px] w-[18px]" style={{ color: BRAND_VAR.purple }} aria-hidden />
              </div>
              <p className="font-semibold text-foreground">{WORDS.title}</p>
            </div>

            {/* The real five-step indicator */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-3 border-b border-glass px-5 py-4 md:py-3">
              {WORDS.steps.map((label, i) => {
                const Icon = done(i) ? Check : STEP_ICONS[i];
                const on = i === current;
                const brand = on ? "purple" : done(i) ? "emerald" : null;
                return (
                  <Fragment key={label}>
                    <span
                      className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-medium transition-colors duration-300"
                      style={
                        brand
                          ? { color: BRAND_VAR[brand], backgroundColor: tint(brand, 12), borderColor: tint(brand, 28) }
                          : { borderColor: "var(--border-glass)" }
                      }
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      <span className={brand ? "" : "text-foreground/75"}>{label}</span>
                    </span>
                    {i < WORDS.steps.length - 1 && <ArrowRight className="h-3 w-3 text-foreground/60" aria-hidden />}
                  </Fragment>
                );
              })}
            </div>

            {/* The body of the step on screen */}
            <div className="px-5 py-9 md:py-5">
              <RunBody done={rest} lines={rest ? BODY_WORDS.lines.length : phase === 3 ? lines : 0} />
            </div>
            <ReplayButton onClick={play} disabled={still} label={WORDS.replay} />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

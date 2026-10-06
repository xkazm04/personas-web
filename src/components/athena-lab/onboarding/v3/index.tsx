"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useTranslation } from "@/i18n/useTranslation";
import { staggerContainer } from "@/lib/animations";
import { tint } from "@/lib/brand-theme";
import { useSceneClock } from "../shared/useSceneClock";
import { AgentCard } from "./AgentCard";
import { Lane, Tray } from "./Board";
import { Cables } from "./Cables";
import { Cursor } from "./Cursor";
import { ART_AR, CYCLE, ROUNDS, STILL_TICK, TICK_MS, cardAt, herAt, herLineAt, roundAt, runningAt, youAt } from "./script";

/**
 * Athena lab, onboarding v3 — "Two Cursors".
 *
 * "Set up together" taken literally: a shared setup board, the way two people
 * build something in a multiplayer editor, with two cursors on it. Yours is
 * the one that DECIDES — what the agent should do, when it runs. Hers is the
 * one that does the WIRING — she drags your tools in from the tray, connects
 * them while you watch the handshake, and presses Start. Her name tag says
 * what she is doing ("I'll connect it", "your call"), and nothing on the
 * board happens without one of the two hands. Each finished card flies into
 * the Running lane; the second agent goes faster than the first, because by
 * then you both know the moves. The empty product never appears — the board
 * is never yours alone.
 *
 * Words: SectionIntro, the board's own labels, her short tag lines, one mono
 * status line. Clock: `useSceneClock`; reduced motion pins round 2 mid-build
 * over a lane that already holds the first agent.
 */
export default function OnboardingTwoCursors() {
  const { t } = useTranslation();
  const intro = t.athenaPage.onboarding.intro;
  const v = t.athenaLab.onboarding.v3;
  const { sectionRef, phase, reduced, live } = useSceneClock({ cycle: CYCLE, tickMs: TICK_MS, still: STILL_TICK });
  const card = cardAt(phase);
  const running = runningAt(phase);
  const r = ROUNDS[roundAt(phase)];
  const inUse = [0, 1, 2, 3].map((i) => (running > 0 && ROUNDS[0].tools.includes(i)) || r.tools.some((ti, k) => ti === i && card.sockets[k] !== "empty"));
  const line = herLineAt(phase);
  const status = running > 0 ? v.statusRunning.replace("{n}", String(running)) : t.athenaPage.onboarding.status.setup;

  return (
    <AthenaStage>
      <section ref={sectionRef} data-stage="fill" aria-label={t.athenaLab.onboarding.label} className="relative flex flex-col px-4 py-14 sm:px-6">
        <div data-stage-inner className="mx-auto flex w-full min-h-0 flex-1 flex-col">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={staggerContainer}>
            <SectionIntro eyebrow={intro.eyebrow} heading={intro.heading} gradient={intro.gradient} className="mb-8" />
          </motion.div>

          <div data-stage-slot className="overflow-x-auto md:overflow-visible">
            <div
              data-stage-art
              role="img"
              aria-label={v.aria}
              className="@container relative mx-auto w-[56rem] max-w-none rounded-3xl border border-glass bg-surface/40 md:w-full"
              style={{ "--art-ar": ART_AR, aspectRatio: `${ART_AR}`, backgroundImage: `radial-gradient(${tint("cyan", 14)} 1px, transparent 1.2px)`, backgroundSize: "22px 22px" } as CSSProperties}
            >
              <div className="absolute inset-0" aria-hidden="true">
                <span className={`absolute left-[3.5%] top-[4%] whitespace-nowrap ${ANNOTATION_DIM}`}>{status}</span>
                <span className="absolute right-[2.5%] top-[3%] flex items-center -space-x-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-foreground text-background">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-background">
                    <Image src="/athena/athena_baseline_640.webp" alt="" fill sizes="32px" className="object-cover" />
                  </span>
                </span>
                <Tray inUse={inUse} />
                <Lane running={running} phase={phase} live={live} reduced={reduced} />
                <Cables phase={phase} reduced={reduced} />
                <AgentCard s={card} reduced={reduced} />
                <Cursor who="you" state={youAt(phase)} tick={phase} name={v.you} line={null} reduced={reduced} />
                <Cursor who="her" state={herAt(phase)} tick={phase} name={v.athena} line={line ? v.lines[line] : null} reduced={reduced} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}

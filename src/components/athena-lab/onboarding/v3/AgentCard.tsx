"use client";

import { motion } from "framer-motion";
import { Check, Play, Sparkles } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { Socket } from "./Socket";
import { CARD, ROUNDS, START, TOOLS, laneRow, option, socket, when, type Box, type CardState } from "./script";
import { T, at } from "./Board";

/**
 * The agent being set up — one card the two of you fill in together. Its
 * parts are placed from the same boxes the cursors aim at (converted to the
 * card's own frame), so a click always lands on the thing it changes. When
 * she presses Start the card commits, then flies into the Running lane and a
 * fresh one takes its place for the next agent.
 */

const inCard = (b: Box): Box => ({
  x: ((b.x - CARD.x) / CARD.w) * 100,
  y: ((b.y - CARD.y) / CARD.h) * 100,
  w: (b.w / CARD.w) * 100,
  h: (b.h / CARD.h) * 100,
});

/** Where the card flies to on launch, in its own width/height units. */
function flight(round: number) {
  const row = laneRow(round);
  const dx = row.x + row.w / 2 - (CARD.x + CARD.w / 2);
  const dy = row.y + row.h / 2 - (CARD.y + CARD.h / 2);
  return { x: `${(dx / CARD.w) * 100}%`, y: `${(dy / CARD.h) * 100}%` };
}

const label = (y: number) => ({ left: `${((28 - CARD.x) / CARD.w) * 100}%`, top: `${((y - CARD.y) / CARD.h) * 100}%` });

export function AgentCard({ s, reduced }: { s: CardState; reduced: boolean }) {
  const { t } = useTranslation();
  const v = t.athenaLab.onboarding.v3;
  const c = t.athenaPage.onboarding.canvas;
  // Round 2 is the empty card the board keeps ready for the next agent.
  const ghost = s.round >= ROUNDS.length;
  const r = ghost ? { ...ROUNDS[0], tools: [] } : ROUNDS[s.round];
  const jobs = [c.template.title, c.templateAlt.title, c.runsRows[1].name];
  const whens = [c.template.schedule, c.templateAlt.schedule];
  const fly = flight(Math.min(s.round, ROUNDS.length - 1));
  return (
    <motion.div
      key={s.round}
      className={`absolute rounded-2xl border bg-surface/80 backdrop-blur-sm ${ghost ? "border-dashed" : ""}`}
      style={{
        ...at(CARD),
        borderColor: tint("cyan", s.pressed ? 55 : ghost ? 22 : 28),
        boxShadow: ghost ? "none" : brandShadow("cyan", s.pressed ? 34 : 18, s.pressed ? 30 : 14),
      }}
      initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }}
      animate={s.launched && !reduced ? { opacity: 0, x: fly.x, y: fly.y, scale: 0.3 } : { opacity: ghost ? 0.6 : 1, x: 0, y: 0, scale: 1 }}
      transition={reduced ? { duration: 0 } : s.launched ? { duration: 0.75, ease: [0.5, 0, 0.3, 1] } : SPRING_POP}
    >
      {/* Title — "New agent" until you say what it is */}
      <span className="absolute flex items-center gap-3" style={label(16.5)}>
        <span
          className="flex h-[clamp(2rem,2.6cqw,3rem)] w-[clamp(2rem,2.6cqw,3rem)] items-center justify-center rounded-xl"
          style={{ backgroundColor: tint("cyan", s.picked ? 18 : 7) }}
        >
          <Sparkles className="h-1/2 w-1/2 text-brand-cyan" aria-hidden="true" />
        </span>
        <motion.span
          key={s.picked ? "named" : "draft"}
          className={`text-[clamp(1.25rem,1.7cqw,2.1rem)] font-semibold ${s.picked ? "text-foreground" : "text-muted-dark"}`}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: s.picked ? 0.6 : 0 }}
        >
          {s.picked ? jobs[r.job] : t.athenaPage.onboarding.chrome.newAgent}
        </motion.span>
      </span>

      <span className={`absolute ${ANNOTATION_DIM}`} style={label(28)}>{v.doLabel}</span>
      {jobs.map((name, i) => (
        <Chip key={name} box={inCard(option(i))} on={s.picked && i === r.job} reduced={reduced}>
          {name}
        </Chip>
      ))}

      <span className={`absolute ${ANNOTATION_DIM}`} style={label(47)}>{v.usesLabel}</span>
      {[0, 1].map((k) => (
        <Socket
          key={k}
          box={inCard(socket(k))}
          tool={k < r.tools.length ? TOOLS[r.tools[k]] : null}
          name={k < r.tools.length ? v.toolNames[r.tools[k]] : ""}
          state={k < r.tools.length ? s.sockets[k] : "empty"}
          reduced={reduced}
        />
      ))}

      <span className={`absolute ${ANNOTATION_DIM}`} style={label(67)}>{v.whenLabel}</span>
      {whens.map((w, i) => (
        <Chip key={w} box={inCard(when(i))} on={s.whenPicked && i === r.when} reduced={reduced}>
          {w}
        </Chip>
      ))}

      <span
        className={`absolute flex items-center justify-center gap-2 rounded-xl border font-semibold ${T}`}
        style={{
          ...at(inCard(START)),
          borderColor: s.pressed ? BRAND_VAR.cyan : tint("cyan", 45),
          backgroundColor: s.pressed ? BRAND_VAR.cyan : "transparent",
          color: s.pressed ? "var(--background)" : BRAND_VAR.cyan,
          transition: reduced ? undefined : "background-color 400ms 500ms, color 400ms 500ms",
        }}
      >
        {s.pressed ? <Check className="h-5 w-5" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        {s.pressed ? v.started : v.start}
      </span>
    </motion.div>
  );
}

/** A choice chip: quiet until it is the one picked; then it fills, a beat
 *  after the click ring lands on it. */
function Chip({ box, on, reduced, children }: { box: Box; on: boolean; reduced: boolean; children: string }) {
  return (
    <span
      className={`absolute flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2 ${T} ${on ? "font-medium text-foreground" : "text-muted-dark"}`}
      style={{
        ...at(box),
        borderColor: on ? tint("cyan", 60) : "var(--border-glass-hover)",
        backgroundColor: on ? tint("cyan", 16) : "transparent",
        transition: reduced ? undefined : "background-color 350ms 550ms, border-color 350ms 550ms, color 350ms 550ms",
      }}
    >
      {children}
    </span>
  );
}

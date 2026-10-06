"use client";

import { motion } from "framer-motion";
import { Sparkles, Workflow } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { AGENT, SCRIPT, endOf, mix, type Line } from "./shared/scenarios";
import Bubble, { Typing } from "./Bubble";
import Outcome from "./Outcome";

/** One side of the split screen: a lit chat window that fills with its
 *  system's replies on the shared clock. Newest line pins to the bottom
 *  (flex-col-reverse) so the window never grows; older lines fade under the
 *  top edge. The agent's window lights up the moment it resolves. */
export default function ChatWindow({
  kind,
  lines,
  texts,
  t,
  stars,
  outcome,
  still,
  running,
  runKey,
}: {
  kind: "scripted" | "agent";
  lines: Line[];
  texts: string[];
  t: number;
  stars: number;
  outcome: string;
  still: boolean;
  running: boolean;
  runKey: number;
}) {
  const c = useTranslation().t.howSections.chat;
  const isAgent = kind === "agent";
  const color = isAgent ? SCRIPT_OR_AGENT.agent : SCRIPT_OR_AGENT.scripted;
  const shown = lines.filter((l) => l.at <= t).length;
  const next = lines[shown];
  const typing = !!next && t > 0.4 && next.at - t < 1.1;
  const done = t >= endOf(lines) + 0.5;
  const lit = isAgent && done;
  const Icon = isAgent ? Sparkles : Workflow;

  return (
    <div
      className="relative flex h-[26rem] min-h-0 flex-col overflow-hidden rounded-2xl border transition-[box-shadow,border-color] duration-700 stage:h-auto"
      style={{
        borderColor: mix(color, lit ? 55 : 26),
        background: `linear-gradient(180deg, ${mix(color, 9)} 0%, color-mix(in srgb, var(--surface) 55%, transparent) 38%, color-mix(in srgb, var(--background) 70%, transparent) 100%)`,
        boxShadow: `inset 0 1px 0 ${mix(color, 35)}, 0 30px 70px -40px ${mix(color, lit ? 80 : 45)}${lit ? `, 0 0 0 1px ${mix(color, 25)}` : ""}`,
      }}
    >
      {/* Header: who is answering and how it works. */}
      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: mix(color, 18) }}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: mix(color, 16), color }}>
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold leading-tight text-foreground">{isAgent ? c.agent : c.scripted}</span>
          <span className="block font-mono text-xs uppercase tracking-[0.14em]" style={{ color }}>
            {isAgent ? c.v1.agentMode : c.v1.scriptedMode}
          </span>
        </span>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}`, opacity: done ? 1 : 0.55 }} aria-hidden />
      </div>

      {/* Transcript. Top-anchored while it fits; once it overflows, the
          column-reverse box pins the newest line to the bottom and older lines
          slide up under the faded top edge - the window never grows. */}
      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-hidden px-4 pt-4 pb-3 [mask-image:linear-gradient(to_bottom,transparent_0,black_1.5rem)]">
        <div className="mb-auto flex flex-col gap-2.5">
          {lines.slice(0, shown).map((l, i) => (
            <Bubble key={`${runKey}-${i}`} kind={kind} tone={l.tone} at={l.at} text={texts[i]} still={still} />
          ))}
          <div className="h-7 shrink-0">{typing && !done && <Typing color={color} still={!running} />}</div>
        </div>
      </div>

      <Outcome kind={kind} done={done} text={outcome} seconds={endOf(lines)} stars={stars} still={still} />

      {/* The agent's resolve: one soft sweep of light across the window. */}
      {lit && !still && (
        <motion.span
          key={`sweep-${runKey}`}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{ background: `linear-gradient(90deg, transparent, ${mix(color, 18)}, transparent)` }}
          initial={{ x: "0%" }}
          animate={{ x: "420%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

const SCRIPT_OR_AGENT = { scripted: SCRIPT, agent: AGENT };

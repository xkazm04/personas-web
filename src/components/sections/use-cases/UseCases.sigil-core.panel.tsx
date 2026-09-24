"use client";

import { AnimatePresence, motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import ConnectorIcon from "./components/ConnectorIcon";
import { tools } from "./data";
import PersonaSigil from "./UseCases.sigil-core.sigil";
import { PERSONA, TOOL_COUNT, TOOL_DIMS, jobsFor, lift } from "./UseCases.sigil-core.model";

export interface LocalTool {
  name: string;
  cases: { title: string; desc: string }[];
}

/**
 * The jobs panel: the persona's identity row (unchanged whatever is selected),
 * the selected tool's jobs as the persona's capabilities, and the running
 * tally of jobs picked up, derived from the data (tools x their jobs).
 */
export default function JobsPanel({
  local,
  attached,
  selected,
  armed,
  playing,
  eyebrow,
  panelId,
  labelledBy,
}: {
  local: LocalTool[];
  attached: number;
  selected: number;
  armed: boolean;
  playing: boolean;
  eyebrow: string;
  panelId: string;
  labelledBy: string;
}) {
  const tool = tools[selected];
  const loc = local[selected];
  const edge = lift(tool.color);

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-live={playing ? "off" : "polite"}
      className="flex min-h-[400px] flex-col rounded-2xl border border-glass bg-white/[0.03] p-4 sm:p-5"
    >
      {/* Identity: the same on every tool. */}
      <div className="flex items-center gap-3 border-b border-glass pb-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
          style={{ backgroundColor: tint(PERSONA.brand, 8), borderColor: tint(PERSONA.brand, 20) }}
        >
          <PersonaSigil lit={TOOL_DIMS} className="h-9 w-9" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-foreground">{PERSONA.name}</div>
          <div className="text-xs text-muted">Sample persona · name, colour and sigil stay the same</div>
        </div>
        <span className="shrink-0 rounded-md border border-glass px-2 py-0.5 font-mono text-xs text-muted">1 persona</span>
      </div>

      {/* The selected tool's jobs, now this persona's capabilities. */}
      <div className="mt-4 flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
          style={{ borderColor: `color-mix(in srgb, ${edge} 30%, transparent)`, backgroundColor: `color-mix(in srgb, ${tool.color} 10%, transparent)` }}
        >
          <ConnectorIcon src={tool.icon.src} size={16} />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.14em] text-muted-dark">{eyebrow}</div>
          <div className="text-sm font-bold text-foreground">
            {loc.name} <span className="font-mono text-xs font-normal text-muted">+{loc.cases.length} jobs</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.ul key={tool.id} className="mt-3 flex flex-1 flex-col gap-2" exit={armed ? { opacity: 0 } : undefined} transition={{ duration: 0.15 }}>
          {loc.cases.map((c, i) => (
            <motion.li
              key={c.title}
              initial={armed ? { opacity: 0, x: -8 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.08 + i * 0.09, ease: "easeOut" }}
              className="relative overflow-hidden rounded-lg border border-glass bg-white/[0.02] py-2 pl-4 pr-3"
            >
              <span aria-hidden className="absolute inset-y-0 left-0 w-0.5" style={{ backgroundColor: edge }} />
              <div className="text-sm font-semibold text-foreground">{c.title}</div>
              <div className="text-xs leading-relaxed text-muted">{c.desc}</div>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>

      {/* Tally: derived from the data, never invented. */}
      <div className="mt-4 flex items-center gap-3 border-t border-glass pt-3">
        <span className="text-xs text-muted">Picked up</span>
        <div className="flex gap-1" aria-hidden>
          {tools.map((tl, i) => (
            <span
              key={tl.id}
              className="h-1.5 w-3 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i < attached ? lift(tl.color) : "rgba(var(--surface-overlay), 0.12)" }}
            />
          ))}
        </div>
        <span className="ml-auto font-mono text-xs tabular-nums text-foreground/80">
          {jobsFor(attached)} jobs · {attached}/{TOOL_COUNT} tools
        </span>
      </div>
    </div>
  );
}

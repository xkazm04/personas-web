"use client";

import { MousePointerClick } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { frame } from "../shared/Frame";
import { CLAUDE, LOCAL, mix } from "../shared/motion";
import { AGENTS, H, LIST, NAMES, W, agentY, type AgentKey, type Patch } from "./geometry";

/* The agent side of V3: one real button per agent (click = swap its engine),
 * laid over the drawing in viewBox units, plus the hint under the list. */

export default function AgentList({ patch, swap }: { patch: Patch; swap: (a: AgentKey) => void }) {
  const c = useTranslation().t.featuresLab.models;
  const { place, fs } = frame(W, H);

  return (
    <>
      <p className="font-bold uppercase tracking-[0.14em] text-foreground/75" style={{ ...place(LIST.x + 4, 44), ...fs(15, 12) }}>
        {c.v3.agentsTitle}
      </p>
      {AGENTS.map((a, i) => {
        const e = patch[a];
        const col = e === "ollama" ? LOCAL : CLAUDE;
        const label = c.v3.swap.replace("{agent}", c.agents[a]).replace("{engine}", NAMES[e]);
        return (
          <button
            key={a}
            type="button"
            onClick={() => swap(a)}
            aria-label={label}
            title={label}
            className="group flex flex-col items-start justify-center rounded-2xl border border-glass bg-background/60 px-[1.8cqw] text-left backdrop-blur-sm transition-colors hover:border-glass-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
            style={{ ...place(LIST.x, agentY(i) - LIST.h / 2, LIST.w), height: `${(LIST.h / H) * 100}%`, boxShadow: `inset 3px 0 0 ${mix(col, 80)}` }}
          >
            <span className="font-bold leading-tight text-foreground" style={fs(22, 16)}>
              {c.agents[a]}
            </span>
            <span className="font-semibold leading-tight transition-colors duration-500" style={{ ...fs(15, 12), color: col }}>
              {`→ ${NAMES[e]}`}
            </span>
          </button>
        );
      })}
      <p className="flex items-center gap-2 text-foreground/70" style={{ ...place(LIST.x + 4, agentY(AGENTS.length - 1) + 50), ...fs(16, 13) }}>
        <MousePointerClick className="h-[1.1em] w-[1.1em]" aria-hidden />
        {c.v3.hint}
      </p>
    </>
  );
}

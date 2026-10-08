"use client";

import { useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { howSectionsCopy } from "@/i18n/pending/howSections";

export type HubVariant = "swarm" | "lanes";
const ORDER: HubVariant[] = ["swarm", "lanes"];

/** The live section's view switch: a real tablist with arrow-key roving focus. */
export default function Tabs({ uid, value, onChange }: { uid: string; value: HubVariant; onChange: (v: HubVariant) => void }) {
  const copy = howSectionsCopy.events.v1;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const labels = { swarm: [copy.tabLive, copy.tabLiveHint], lanes: [copy.tabLanes, copy.tabLanesHint] } as const;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = ORDER.indexOf(value);
    const next = (i + (e.key === "ArrowRight" ? 1 : ORDER.length - 1)) % ORDER.length;
    onChange(ORDER[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={copy.tabsLabel} className="flex items-center gap-1 rounded-full border border-glass bg-surface/50 p-1 backdrop-blur-sm">
      {ORDER.map((id, i) => {
        const active = id === value;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${id}`}
            aria-selected={active}
            aria-controls={`${uid}-panel-${id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={onKeyDown}
            className={`relative rounded-full px-4 py-2 text-left transition-colors ${active ? "text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {active && (
              <motion.span
                layoutId={`${uid}-tab-pill`}
                className="absolute inset-0 rounded-full border border-brand-cyan/40 bg-brand-cyan/12"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative block font-mono text-sm font-semibold uppercase tracking-wider">{labels[id][0]}</span>
            <span className="relative block text-xs">{labels[id][1]}</span>
          </button>
        );
      })}
    </div>
  );
}

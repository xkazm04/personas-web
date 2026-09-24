"use client";

import { useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Check, Pause, Play, RotateCcw } from "lucide-react";
import ConnectorIcon from "./components/ConnectorIcon";
import { tools } from "./data";

/**
 * The tab row of the eight real tools. Choosing one connects it to the persona
 * and shows its jobs. A thin bar under the tool about to connect shows the beat
 * while playback runs; the control at the end pauses, resumes or replays.
 */
export default function ToolTabs({
  uid,
  panelId,
  attached,
  focus,
  nextId,
  beatMs,
  ticking,
  playing,
  complete,
  still,
  onChoose,
  onToggle,
}: {
  uid: string;
  panelId: string;
  attached: string[];
  focus: string | null;
  nextId: string | null;
  beatMs: number;
  ticking: boolean;
  playing: boolean;
  complete: boolean;
  still: boolean;
  onChoose: (id: string) => void;
  onToggle: () => void;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const current = tools.findIndex((tl) => tl.id === focus);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let n: number | null = null;
    if (e.key in keys) n = (Math.max(current, 0) + keys[e.key] + tools.length) % tools.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tools.length - 1;
    if (n === null) return;
    e.preventDefault();
    onChoose(tools[n].id);
    refs.current[tools[n].id]?.focus();
  };

  const label = playing ? "Pause" : complete ? "Replay" : "Play";
  const Icon = playing ? Pause : complete ? RotateCcw : Play;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="tablist"
        aria-label="Connect a tool to the persona"
        onKeyDown={onKey}
        className="grid w-full grid-cols-4 gap-2 lg:grid-cols-8"
      >
        {tools.map((tl, i) => {
          const on = attached.includes(tl.id);
          const selected = tl.id === focus;
          return (
            <button
              key={tl.id}
              ref={(node) => {
                refs.current[tl.id] = node;
              }}
              id={`${uid}-tool-${tl.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected || (current < 0 && i === 0) ? 0 : -1}
              onClick={() => onChoose(tl.id)}
              className={`relative flex min-w-0 flex-col items-center gap-1.5 overflow-hidden rounded-lg border px-1.5 py-2 text-center sm:flex-row sm:gap-2 sm:px-2.5 sm:text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 ${
                selected ? "bg-white/[0.06]" : "border-glass bg-white/[0.02] hover:border-glass-hover hover:bg-white/[0.04]"
              }`}
              style={selected ? { borderColor: `${tl.color}90` } : undefined}
            >
              <span
                className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${tl.color}24` }}
              >
                <ConnectorIcon src={tl.icon.src} size={14} />
                {on && (
                  <span className="absolute -right-1 -bottom-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-emerald">
                    <Check className="h-2 w-2 text-background" strokeWidth={3.5} aria-hidden />
                    <span className="sr-only">connected</span>
                  </span>
                )}
              </span>
              <span className={`w-full min-w-0 truncate text-xs font-medium sm:flex-1 ${selected ? "text-foreground" : "text-muted"}`}>
                {tl.name}
              </span>
              {ticking && nextId === tl.id && !still && (
                <motion.span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-cyan"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: beatMs / 1000, ease: "linear" }}
                />
              )}
            </button>
          );
        })}
      </div>
      {/* Reserved height so the reduced-motion form (no control) does not shift */}
      <div className="h-7">
      {!still && (
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-full border border-glass px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60"
        >
          <Icon className="h-3 w-3" aria-hidden />
          {label}
        </button>
      )}
      </div>
    </div>
  );
}

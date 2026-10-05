import { formatClock, type FleetAgent } from "../fleet-data";
import type { NightEvent } from "./nightStore";
import { KIND_COLOR, textTone } from "./palette";
import { LABEL, READING } from "./lantern-placement";
import { GROUND } from "./city-layout";
import type { CityCopy } from "./vocab";
import s from "./night.module.css";

const SLOTS = 3;

interface TickerProps {
  copy: CityCopy;
  events: NightEvent[];
  byId: Map<string, FleetAgent>;
  width: number;
  still: boolean;
}

/** The street's departure board: the three newest events, sliding right as new
 *  ones arrive. */
export default function Ticker({ copy, events, byId, width, still }: TickerProps) {
  const list = events.slice(0, SLOTS);
  const rowW = width - 72 - 96;
  const slot = rowW / SLOTS;
  return (
    <div
      aria-label={copy.tickerLabel}
      className="absolute left-9 right-9 flex h-11 items-center overflow-hidden rounded-[10px]"
      style={{
        top: GROUND + 94,
        background: "color-mix(in oklab, var(--background) 86%, var(--brand-amber))",
        border: "1px solid color-mix(in oklab, var(--brand-amber) 38%, transparent)",
        boxShadow: "0 0 24px -8px color-mix(in oklab, var(--brand-amber) 45%, transparent)",
      }}
    >
      <span className="flex h-full w-24 flex-none items-center gap-2 border-r px-4 uppercase tracking-widest" style={{ fontSize: LABEL, color: textTone("var(--brand-amber)"), borderColor: "color-mix(in oklab, var(--brand-amber) 25%, transparent)" }}>
        <i className={`h-2 w-2 rounded-full ${still ? "" : s.liveDot}`} style={{ background: "var(--brand-amber)" }} />
        {copy.live}
      </span>
      <div className="relative h-full flex-1 overflow-hidden">
        {list.map((e, i) => {
          const a = byId.get(e.agentId);
          const to = e.toAgentId ? byId.get(e.toAgentId) : null;
          return (
            <div
              key={e.id}
              className={`${s.tk} ${still ? "" : s.tkIn} flex items-center gap-2.5 overflow-hidden whitespace-nowrap border-r px-4`}
              style={{ width: slot, transform: `translateX(${i * slot}px)`, borderColor: "color-mix(in oklab, var(--brand-amber) 14%, transparent)" }}
            >
              <span className="flex-none font-mono text-muted-dark" style={{ fontSize: LABEL }}>{formatClock(e.tsMs).slice(0, 5)}</span>
              <span className="flex-none font-mono font-bold" style={{ fontSize: 19, color: textTone(KIND_COLOR[e.kind]) }}>
                {a?.callsign}
                {to ? ` → ${to.callsign}` : ""}
              </span>
              <span className="min-w-0 flex-1 truncate text-foreground" style={{ fontSize: READING }}>{e.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

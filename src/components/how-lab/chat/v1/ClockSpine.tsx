"use client";

import { Check } from "lucide-react";
import { AGENT, CUSTOMER, SCRIPT, clockText, endOf, mix, type Scenario } from "../shared/scenarios";

const SPAN = 20; // story seconds the ruler covers

/** The shared clock between the windows: one ruler, one playhead, a rose tick
 *  on the left for every scripted reply and an emerald tick on the right for
 *  every agent reply. The agent's ticks stop early with a check; the script's
 *  keep going. */
export default function ClockSpine({ scenario, t, label }: { scenario: Scenario; t: number; label: string }) {
  const y = (sec: number) => `${(Math.min(sec, SPAN) / SPAN) * 100}%`;
  const agentEnd = endOf(scenario.agent);
  const shownT = Math.min(t, endOf(scenario.scripted));

  return (
    <div className="hidden min-h-0 flex-col items-center px-2 md:flex" aria-hidden>
      <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.08em] text-muted">{label}</span>
      <span className="mt-1 rounded-md px-2 py-0.5 font-mono text-lg font-semibold tabular-nums text-foreground" style={{ background: mix(CUSTOMER, 12), boxShadow: `inset 0 0 0 1px ${mix(CUSTOMER, 30)}` }}>
        {clockText(shownT)}
      </span>
      <div className="relative mt-3 mb-2 w-full flex-1">
        {/* Ruler and its 5-second marks. */}
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2" style={{ background: "var(--border-glass-hover)" }} />
        {[5, 10, 15].map((s) => (
          <span key={s} className="absolute left-1/2 h-px w-3 -translate-x-1/2" style={{ top: y(s), background: "var(--border-glass-strong)" }} />
        ))}
        {/* Elapsed: the ruler fills with the clock. */}
        <span className="absolute left-1/2 top-0 w-[3px] -translate-x-1/2 rounded-full" style={{ height: y(shownT), background: `linear-gradient(${mix(CUSTOMER, 30)}, ${mix(CUSTOMER, 70)})` }} />
        {scenario.scripted.map((l, i) => (
          <span
            key={`s${i}`}
            className="absolute right-1/2 mr-2 h-2 w-4 -translate-y-1/2 rounded-full transition-opacity duration-300"
            style={{ top: y(l.at), background: SCRIPT, opacity: l.at <= t ? 0.9 : 0.12 }}
          />
        ))}
        {scenario.agent.map((l, i) => (
          <span
            key={`a${i}`}
            className="absolute left-1/2 ml-2 h-2 w-4 -translate-y-1/2 rounded-full transition-opacity duration-300"
            style={{ top: y(l.at), background: AGENT, opacity: l.at <= t ? 0.9 : 0.12 }}
          />
        ))}
        {/* The agent is done here. */}
        <span
          className="absolute left-1/2 ml-7 flex h-5 w-5 items-center justify-center rounded-full transition-[opacity,transform] duration-500"
          style={{ top: y(agentEnd), background: AGENT, color: "var(--background)", opacity: t >= agentEnd ? 1 : 0, transform: `translateY(-50%) scale(${t >= agentEnd ? 1 : 0.4})` }}
        >
          <Check className="h-3 w-3" />
        </span>
        {/* Playhead. */}
        <span className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ top: y(shownT), background: CUSTOMER, boxShadow: `0 0 12px ${CUSTOMER}` }} />
      </div>
    </div>
  );
}

"use client";

import { formatAge } from "../fleet-data";
import { Overline, ReasonChip } from "./parts";
import { ago, type BoardCopy } from "./copy";
import { fill, pct, type SimAgent } from "./model";

interface AgentSideProps {
  agent: SimAgent;
  simMs: number;
  copy: BoardCopy;
  leaving: string | null;
  still: boolean;
  onReview: (rid: string, approve: boolean) => void;
  onRead: () => void;
}

const SEV_ORDER = { critical: 0, warning: 1, info: 2 } as const;
const smallBtn = "rounded-lg px-3 py-1.5 text-sm font-semibold transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/** The right column of the agent scene: decisions waiting, and its inbox. */
export default function AgentSide({ agent: a, simMs, copy, leaving, still, onReview, onRead }: AgentSideProps) {
  const reviews = [...a.reviews].sort((x, y) => SEV_ORDER[x.severity] - SEV_ORDER[y.severity] || y.ageMin - x.ageMin);
  const kv: [string, string | number][] = [
    [copy.spot.runsToday, a.runsToday], [copy.spot.success, pct(a.successRate)], [copy.spot.costToday, `$${a.costTodayUsd.toFixed(2)}`],
  ];
  return (
    <div className="h-full overflow-y-auto pb-8 [mask-image:linear-gradient(180deg,#000_90%,transparent)]">
      <dl className="mb-4 grid grid-cols-3 gap-2.5">
        {kv.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] px-3 py-2 shadow-[inset_0_0_0_1px_var(--border-glass)]">
            <dt className="text-xs text-muted-dark">{k}</dt>
            <dd className="text-2xl font-semibold tabular-nums text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <Overline className="mb-2.5 justify-between">
        <span>{fill(copy.agent.reviewsCount, { n: a.reviews.length })}</span>
        {a.reviews.length > 0 && <span className="normal-case tracking-normal">{copy.agent.oldestDecides}</span>}
      </Overline>
      {reviews.length ? reviews.map((r) => (
        <div
          key={r.id}
          className={`mb-2.5 rounded-2xl bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)] px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--border-glass)] transition-[opacity,transform] duration-300 ${
            leaving === r.id ? (still ? "opacity-0" : "translate-x-8 opacity-0") : ""
          }`}
        >
          <ReasonChip cls={r.severity} label={copy.severity[r.severity]} />
          <p className="my-2 text-lg leading-snug text-foreground">{r.title}</p>
          <div className="flex items-center gap-2">
            <button type="button" data-agent-act className={`${smallBtn} bg-brand-cyan text-background`} onClick={() => onReview(r.id, true)}>
              {copy.agent.approve}
            </button>
            <button type="button" className={`${smallBtn} border border-glass-hover text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]`} onClick={() => onReview(r.id, false)}>
              {copy.agent.sendBack}
            </button>
            <span className="ml-auto text-xs text-muted-dark">
              {fill(copy.agent.waiting, { age: formatAge((r.ageMin + simMs / 60_000) * 60_000) })}
            </span>
          </div>
        </div>
      )) : <p className="pb-3 text-base text-muted-dark">{copy.agent.noDecisions}</p>}
      <Overline className="mb-1 mt-4 justify-between">
        <span>{fill(copy.agent.unreadCount, { n: a.unreadMessages.length })}</span>
        {a.unreadMessages.length > 0 && (
          <button type="button" className={`${smallBtn} border border-glass-hover normal-case tracking-normal text-foreground`} onClick={onRead}>
            {copy.agent.markRead}
          </button>
        )}
      </Overline>
      {a.unreadMessages.length ? a.unreadMessages.map((m) => (
        <div key={m.id} className="flex gap-3 border-b border-glass py-2 text-base text-muted-dark">
          <span>{m.text}</span>
          <span className="ml-auto whitespace-nowrap text-xs">{ago((m.ageMin + simMs / 60_000) * 60_000, copy)}</span>
        </div>
      )) : <p className="py-2 text-base text-muted-dark">{copy.agent.inboxClear}</p>}
    </div>
  );
}

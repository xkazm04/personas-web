"use client";

import { Loader2 } from "lucide-react";
import { formatAge } from "../fleet-data";
import { Overline, ReasonChip } from "./parts";
import { ago, type BoardCopy } from "./copy";
import { fill, type SimAgent } from "./model";
import { HOLD_MS, isOpen, type Command } from "./useCommands";
import type { CSSProperties } from "react";
import b from "./board.module.css";

interface AgentSideProps {
  agent: SimAgent;
  simMs: number;
  copy: BoardCopy;
  cmds: readonly Command[];
  still: boolean;
  offline: boolean;
  hostName: string;
  onReview: (rid: string, approve: boolean) => void;
  onUndo: (commandId: number) => void;
  onRead: () => void;
}

const SEV_ORDER = { critical: 0, warning: 1, info: 2 } as const;
const smallBtn = "rounded-lg px-3 py-1.5 text-sm font-semibold transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/** A verdict on its way: held (with Undo and the window running out), then
 *  sending and acknowledged; it leaves the list when the machine has done it. */
function Decided({ cmd, copy, still, hostName, onUndo }: { cmd: Command; copy: BoardCopy; still: boolean; hostName: string; onUndo: (id: number) => void }) {
  const verb = cmd.verb === "approve" ? copy.cmd.decided.approve : copy.cmd.decided.sendback;
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-foreground">{verb}</span>
        {cmd.status !== "held" && <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin text-brand-cyan" />}
        <span className="text-muted-dark">{cmd.status === "held" ? copy.cmd.status.held : fill(copy.cmd.status[cmd.status === "acked" ? "acked" : "sending"], { host: hostName })}</span>
        {cmd.status === "held" && (
          <button type="button" className={`${smallBtn} ml-auto border border-glass-hover text-foreground`} onClick={() => onUndo(cmd.id)}>
            {copy.cmd.undo}
          </button>
        )}
      </div>
      {cmd.status === "held" && !still && (
        <div className={`${b.holdDrain} mt-2 h-0.5 rounded-full bg-brand-cyan`} style={{ "--hold": `${HOLD_MS}ms` } as CSSProperties} aria-hidden />
      )}
    </div>
  );
}

/** The right column of the agent scene: decisions waiting, and its inbox. */
export default function AgentSide({ agent: a, simMs, copy, cmds, still, offline, hostName, onReview, onUndo, onRead }: AgentSideProps) {
  const verdictOn = (rid: string) => cmds.find((c) => c.agentId === a.id && c.rid === rid && isOpen(c));
  const reading = cmds.some((c) => c.agentId === a.id && c.verb === "read" && isOpen(c));
  const reviews = [...a.reviews].sort((x, y) => SEV_ORDER[x.severity] - SEV_ORDER[y.severity] || y.ageMin - x.ageMin);
  return (
    <div className="h-full overflow-y-auto pb-8 [mask-image:linear-gradient(180deg,#000_90%,transparent)]">
      <Overline className="mb-2.5 justify-between">
        <span>{fill(copy.agent.reviewsCount, { n: a.reviews.length })}</span>
        {a.reviews.length > 0 && <span className="normal-case tracking-normal">{copy.agent.oldestDecides}</span>}
      </Overline>
      {reviews.length ? reviews.map((r) => {
        const v = verdictOn(r.id);
        return (
          <div
            key={r.id}
            className={`mb-2.5 overflow-hidden rounded-2xl px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--border-glass)] transition-[opacity,background-color] duration-300 ${
              v ? "bg-[color-mix(in_oklab,var(--brand-cyan)_7%,transparent)]" : "bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]"
            }`}
          >
            <ReasonChip cls={r.severity} label={copy.severity[r.severity]} />
            <p className={`my-2 text-lg leading-snug ${v ? "text-muted-dark line-through decoration-1" : "text-foreground"}`}>{r.title}</p>
            {v ? <Decided cmd={v} copy={copy} still={still} hostName={hostName} onUndo={onUndo} /> : (
              <div className="flex items-center gap-2">
                <button type="button" data-agent-act className={`${smallBtn} bg-brand-cyan text-background`} disabled={offline} onClick={() => onReview(r.id, true)}>
                  {copy.agent.approve}
                </button>
                <button type="button" className={`${smallBtn} border border-glass-hover text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]`} disabled={offline} onClick={() => onReview(r.id, false)}>
                  {copy.agent.sendBack}
                </button>
                <span className="ml-auto text-xs text-muted-dark">
                  {fill(copy.agent.waiting, { age: formatAge((r.ageMin + simMs / 60_000) * 60_000) })}
                </span>
              </div>
            )}
          </div>
        );
      }      ) : <p className="pb-3 text-base text-muted-dark">{copy.agent.noDecisions}</p>}
      <Overline className="mb-1 mt-4 justify-between">
        <span>{fill(copy.agent.unreadCount, { n: a.unreadMessages.length })}</span>
        {a.unreadMessages.length > 0 && (
          <button type="button" className={`${smallBtn} border border-glass-hover normal-case tracking-normal text-foreground`} disabled={offline || reading} onClick={onRead}>
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

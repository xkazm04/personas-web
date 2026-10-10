import { fill, plural, type SimAgent } from "./model";
import type { BoardCopy } from "./copy";
import { openControl, type Commands } from "./useCommands";
import type { ToastAction } from "./useBoardRuntime";
import type { BulkVerb } from "./fleetTable";
import { admit, type RuleVerb } from "./verbs";

interface OperatorDeps {
  commands: Commands;
  toast: (text: string, action?: ToastAction) => void;
  copy: BoardCopy;
  hostName: string;
  offline: boolean;
  /** Now, in sim time: stamped on each command for the activity log. */
  simMs: number;
}

/**
 * Everything the operator can do to the fleet, as commands to the machine with
 * the toast that says so. Verdicts are held for an Undo window first. While the
 * machine is offline nothing is sent: the controls are disabled with the reason,
 * and these calls are no-ops as a second line. Run verbs (pause, resume, run,
 * cancel, retry) go through the rulebook (verbs.ts) with the plane's context:
 * a verb the agent does not admit, or one on an agent whose previous run
 * command is still open, is not sent.
 */
export function makeOperator({ commands: raw, toast, copy: c, hostName, offline, simMs }: OperatorDeps) {
  const host = { host: hostName };
  const commands = { ...raw, send: (spec: Parameters<Commands["send"]>[0], hold?: boolean) => raw.send({ ...spec, atSim: simMs }, hold) };
  /** Why this run verb would not be sent to this agent now (null: it is sent). */
  const refusal = (verb: RuleVerb, a: SimAgent) => admit(verb, a, { offline, pending: !!openControl(raw.cmds, a.id) });
  const agentVerb = (verb: RuleVerb | "read", a: SimAgent, text: string) => {
    if (verb === "read" ? offline : refusal(verb, a)) return;
    commands.send({ verb, agentId: a.id });
    toast(text);
  };
  const undo = (id: number) => {
    if (commands.undo(id)) toast(fill(c.cmd.undone, host));
  };
  return {
    offline,
    refusal,
    undo,
    pause: (a: SimAgent) => agentVerb("pause", a, fill(c.cmd.toasts.pause, { callsign: a.callsign })),
    resume: (a: SimAgent) => agentVerb("resume", a, fill(c.cmd.toasts.resume, { callsign: a.callsign })),
    run: (a: SimAgent) => agentVerb("run", a, fill(c.cmd.toasts.run, { callsign: a.callsign })),
    cancel: (a: SimAgent) => agentVerb("cancel", a, fill(c.cmd.toasts.cancel, { callsign: a.callsign })),
    retry: (a: SimAgent) => agentVerb("retry", a, fill(c.toasts.retry, { callsign: a.callsign })),
    answer: (a: SimAgent, text?: string) => {
      if (offline) return;
      commands.send({ verb: "answer", agentId: a.id, text: text?.trim() || undefined });
      toast(fill(c.toasts.answer, { callsign: a.callsign }));
    },
    /** A draft with no review of its own: publish it, or send it back to revise. Held for Undo. */
    draft: (a: SimAgent, approve: boolean) => {
      if (offline) return;
      const id = commands.send({ verb: approve ? "publish" : "revise", agentId: a.id }, true);
      toast(fill(approve ? c.cmd.toasts.publish : c.cmd.toasts.revise, { callsign: a.callsign }), { label: c.cmd.undo, run: () => undo(id) });
    },
    read: (a: SimAgent) => {
      const n = a.unreadMessages.length;
      agentVerb("read", a, fill(plural(n, c.toasts.readOne, c.toasts.read), { callsign: a.callsign, n }));
    },
    verdict: (a: SimAgent, rid: string, approve: boolean) => {
      const r = a.reviews.find((x) => x.id === rid);
      if (offline || !r) return;
      const id = commands.send({ verb: approve ? "approve" : "sendback", agentId: a.id, rid }, true);
      toast(fill(c.toasts[approve ? "approve" : "sendback"], { callsign: a.callsign, title: r.title }), {
        label: c.cmd.undo,
        run: () => undo(id),
      });
    },
    /** One verb to many agents: a command each (only where the rulebook admits it
     *  and no run command is already open on the agent), one toast. */
    bulk: (verb: BulkVerb, agents: readonly SimAgent[]) => {
      if (offline) return 0;
      const ok = agents.filter((a) => refusal(verb, a) === null);
      for (const a of ok) commands.send({ verb, agentId: a.id });
      if (ok.length) toast(fill(c.list.bulkToasts[verb], { n: ok.length, ...host }));
      return ok.length;
    },
    pauseAll: (n: number, stop: number) => {
      if (offline) return;
      commands.send({ verb: "pauseAll", agentId: null, stop: stop > 0 });
      toast(fill(stop ? c.cmd.toasts.pauseAllStop : c.cmd.toasts.pauseAll, { n, m: stop, ...host }));
    },
    resumeAll: (n: number) => {
      if (offline) return;
      commands.send({ verb: "resumeAll", agentId: null });
      toast(fill(c.cmd.toasts.resumeAll, { n, ...host }));
    },
  };
}

export type Operator = ReturnType<typeof makeOperator>;

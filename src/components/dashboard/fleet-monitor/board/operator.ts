import { fill, plural, type SimAgent } from "./model";
import type { BoardCopy } from "./copy";
import type { Commands, Verb } from "./useCommands";
import type { ToastAction } from "./useBoardRuntime";

interface OperatorDeps {
  commands: Commands;
  toast: (text: string, action?: ToastAction) => void;
  copy: BoardCopy;
  hostName: string;
  offline: boolean;
}

/**
 * Everything the operator can do to the fleet, as commands to the machine with
 * the toast that says so. Verdicts are held for an Undo window first. While the
 * machine is offline nothing is sent: the controls are disabled with the reason,
 * and these calls are no-ops as a second line.
 */
export function makeOperator({ commands, toast, copy: c, hostName, offline }: OperatorDeps) {
  const host = { host: hostName };
  const agentVerb = (verb: Exclude<Verb, "approve" | "sendback" | "pauseAll" | "resumeAll">, a: SimAgent, text: string) => {
    if (offline) return;
    commands.send({ verb, agentId: a.id });
    toast(text);
  };
  const undo = (id: number) => {
    if (commands.undo(id)) toast(fill(c.cmd.undone, host));
  };
  return {
    offline,
    undo,
    pause: (a: SimAgent) => agentVerb("pause", a, fill(c.cmd.toasts.pause, { callsign: a.callsign })),
    resume: (a: SimAgent) => agentVerb("resume", a, fill(c.cmd.toasts.resume, { callsign: a.callsign })),
    run: (a: SimAgent) => agentVerb("run", a, fill(c.cmd.toasts.run, { callsign: a.callsign })),
    cancel: (a: SimAgent) => agentVerb("cancel", a, fill(c.cmd.toasts.cancel, { callsign: a.callsign })),
    retry: (a: SimAgent) => agentVerb("retry", a, fill(c.toasts.retry, { callsign: a.callsign })),
    answer: (a: SimAgent) => agentVerb("answer", a, fill(c.toasts.answer, { callsign: a.callsign })),
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

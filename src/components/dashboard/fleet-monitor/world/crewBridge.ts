import { DEMO_CREW, crewAgentId, crewPersonaId } from "@/lib/demoCrew";
import type { CommandVerb } from "@/lib/commands/envelope";
import type { Severity } from "../fleet-data";
import type { SimAction, SimState } from "../board/sim";
import type { FleetWorld, Settled } from "./fleetWorld";

/* ── The crew bridge (demo) ─────────────────────────────────────────
 *
 * Five fleet agents are the five synced personas (`src/lib/demoCrew.ts`).
 * Both ways, through what already exists:
 *
 * - Stage -> pages: a Board command that lands on a crew agent and changes
 *   what the synced pages show (on/off, a review verdict, a run) is sent on
 *   to the demo's command plane (`commandStore` -> `mockCommandPlane`), whose
 *   fixture writes move the phone rows, Executions and Reviews.
 * - Pages -> stage: when the fixtures change (`demoFixtureSignal`), what
 *   changed for a crew persona since the bridge last looked is applied to its
 *   agent as the machine's own action (pause, resume, a verdict, a review
 *   that came in, a run that started).
 *
 * Only changes are mirrored, never absolute state, so the stage keeps its
 * own story for everything the pages do not show, and a Board command still
 * on its way to the fixtures is not undone by an unrelated re-read. The 94
 * stage-only agents never leave the stage. Nothing happens off the demo.
 */

export interface CrewReview {
  id: string;
  status: "pending" | "approved" | "rejected";
  title: string;
  severity: Severity;
}

/** One crew persona as the synced pages see it now. */
export interface CrewFixture {
  personaId: string;
  enabled: boolean;
  reviews: CrewReview[];
  /** Ids of its executions that are queued or running and were started by a command. */
  liveRuns: string[];
}

/** What the bridge needs from the data plane (the demo's: `demoCrewPorts.ts`). */
export interface CrewPorts {
  isDemo: () => boolean;
  read: () => CrewFixture[];
  /** Send a verb for a persona through the command plane; resolves with the command id. */
  send: (verb: CommandVerb, personaId: string, params: Record<string, unknown>) => Promise<string>;
  /** A command (by id) has not reached its outcome yet. */
  isOpen: (commandId: string) => boolean;
  /** The execution a run command creates. */
  runExecutionId: (commandId: string) => string;
  onFixtureChange: (listener: () => void) => () => void;
}

export interface PlaneCommand {
  verb: CommandVerb;
  personaId: string;
  params: Record<string, unknown>;
}

/** What a landed Board command means for the synced pages: the plane commands to send. */
export function planeCommandsFor({ spec, before, after }: Settled): PlaneCommand[] {
  const out: PlaneCommand[] = [];
  for (const { personaId, agentId } of DEMO_CREW) {
    const a = before.agents.find((x) => x.id === agentId);
    const b = after.agents.find((x) => x.id === agentId);
    if (!a || !b) continue;
    if (a.enabled !== b.enabled) out.push({ verb: b.enabled ? "resume_persona" : "pause_persona", personaId, params: {} });
    if (spec.verb === "approve" || spec.verb === "sendback") {
      for (const r of a.reviews) {
        if (b.reviews.some((x) => x.id === r.id)) continue;
        out.push({ verb: "review_decide", personaId, params: { reviewId: r.id, decision: spec.verb === "approve" ? "approved" : "rejected" } });
      }
    }
  }
  const runFor = spec.verb === "run" && spec.agentId ? crewPersonaId(spec.agentId) : null;
  if (runFor) out.push({ verb: "run_persona", personaId: runFor, params: {} });
  return out;
}

/** What the bridge last saw of a crew persona. */
export interface Seen {
  enabled: boolean;
  pending: ReadonlySet<string>;
  runs: ReadonlySet<string>;
}

/** The starting view: the crew agents as seeded (the fixtures' own seed, pinned by the consistency test). */
export function seenFrom(sim: Pick<SimState, "agents">): Map<string, Seen> {
  const out = new Map<string, Seen>();
  for (const { personaId, agentId } of DEMO_CREW) {
    const a = sim.agents.find((x) => x.id === agentId);
    if (a) out.set(personaId, { enabled: a.enabled, pending: new Set(a.reviews.map((r) => r.id)), runs: new Set() });
  }
  return out;
}

/**
 * What changed in the fixtures since `seen`, as sim actions on the crew
 * agents, and the new `seen`. `holding` names the personas whose on/off a
 * Board command is still carrying to the fixtures (their on/off is left for
 * later); `ownRuns` are the executions the Board's own runs made.
 */
export function planSync(
  sim: Pick<SimState, "agents">,
  fixtures: readonly CrewFixture[],
  seen: ReadonlyMap<string, Seen>,
  holding: ReadonlySet<string>,
  ownRuns: ReadonlySet<string>,
): { actions: SimAction[]; seen: Map<string, Seen> } {
  const actions: SimAction[] = [];
  const next = new Map(seen);
  for (const f of fixtures) {
    const id = crewAgentId(f.personaId);
    const a = id ? sim.agents.find((x) => x.id === id) : undefined;
    const was = seen.get(f.personaId);
    if (!id || !a || !was) continue;

    let enabled = was.enabled;
    if (f.enabled !== was.enabled && !holding.has(f.personaId)) {
      if (a.enabled !== f.enabled) actions.push({ type: f.enabled ? "resume" : "pause", id });
      enabled = f.enabled;
    }

    const pending = new Set(f.reviews.filter((r) => r.status === "pending").map((r) => r.id));
    for (const rid of was.pending) {
      if (pending.has(rid) || !a.reviews.some((r) => r.id === rid)) continue;
      actions.push({ type: "review", id, rid, approve: f.reviews.find((r) => r.id === rid)?.status === "approved" });
    }
    for (const r of f.reviews) {
      if (r.status !== "pending" || was.pending.has(r.id) || a.reviews.some((x) => x.id === r.id)) continue;
      actions.push({ type: "reviewIn", id, review: { id: r.id, severity: r.severity, title: r.title, ageMin: 0 } });
    }

    const runs = new Set(was.runs);
    for (const run of f.liveRuns) {
      if (runs.has(run)) continue;
      runs.add(run);
      if (!ownRuns.has(run)) actions.push({ type: "run", id });
    }
    next.set(f.personaId, { enabled, pending, runs });
  }
  return { actions, seen: next };
}

export interface CrewBridge {
  /** Apply what changed in the fixtures since the last look (idempotent). */
  reconcile: () => void;
  dispose: () => void;
}

/** Wire a world to the data plane through `ports`. */
export function bridgeCrew(world: FleetWorld, ports: CrewPorts): CrewBridge {
  let seen = seenFrom(world.store.getState().sim);
  /** On/off commands this bridge sent: persona, and the command id once known. */
  let carrying: { personaId: string; id: string | null }[] = [];
  const ownRuns = new Set<string>();

  const reconcile = () => {
    if (!ports.isDemo()) return;
    carrying = carrying.filter((c) => c.id === null || ports.isOpen(c.id));
    const holding = new Set(carrying.map((c) => c.personaId));
    const plan = planSync(world.store.getState().sim, ports.read(), seen, holding, ownRuns);
    seen = plan.seen;
    plan.actions.forEach(world.dispatch);
  };

  const offSettled = world.onSettled((settled) => {
    if (!ports.isDemo()) return;
    for (const cmd of planeCommandsFor(settled)) {
      const entry = cmd.verb === "pause_persona" || cmd.verb === "resume_persona" ? { personaId: cmd.personaId, id: null as string | null } : null;
      if (entry) carrying.push(entry);
      void ports.send(cmd.verb, cmd.personaId, cmd.params).then(
        (id) => {
          if (entry) entry.id = id;
          if (cmd.verb === "run_persona") ownRuns.add(ports.runExecutionId(id));
        },
        () => {
          if (entry) carrying = carrying.filter((c) => c !== entry);
        },
      );
    }
  });
  const offFixtures = ports.onFixtureChange(reconcile);

  return {
    reconcile,
    dispose: () => {
      offSettled();
      offFixtures();
    },
  };
}

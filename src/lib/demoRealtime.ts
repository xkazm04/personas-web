import { resolveTicker } from "@/lib/motion/loop-gate";
import { MOCK_EVENTS, MOCK_PERSONAS } from "@/lib/mockData";
import { notifyDemoFixtureChange } from "@/lib/demoFixtureSignal";
import type { ChannelLike } from "@/hooks/syncedRealtimeBindings";
import type { PersonaEvent } from "@/lib/types";

/**
 * The demo's realtime source: the same `on(...)` surface as the Supabase
 * channel (`ChannelLike`), fed by a seeded scenario instead of a socket. Beats
 * mutate the fixture collection `mockApi` already serves (MOCK_EVENTS) and then
 * emit a `postgres_changes`-shaped INSERT, so the production path - the
 * debounced store refetch and the new-review voice - runs unchanged.
 *
 * The clock is a data feed (`resolveTicker`): scenario time advances only while
 * the tab is foreground. Beats are keyed to scenario time, not wall time, so a
 * hidden tab does not miss one - it is simply delivered when the tab returns.
 */

/** Scenario milliseconds after entry at which the first review arrives. */
export const FIRST_REVIEW_AT_MS = 20_000;

const TICK_MS = 1_000;

const REVIEW_POOL = [
  { title: "Approve refund over policy limit", description: "A customer refund of $1,240 exceeds the auto-approve ceiling. Waiting on a human verdict.", severity: "warning" },
  { title: "Rotate leaked staging API key", description: "A staging key appeared in a public log line. The agent proposes rotating it now.", severity: "critical" },
  { title: "Send release notes to subscribers", description: "Draft release notes are ready for the 2,310-person mailing list.", severity: "info" },
] as const;

/** Small deterministic PRNG (mulberry32): the same seed replays the same scenario. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `?seed=` from the URL, else a fixed default so screenshots stay reproducible. */
export function demoSeedFromUrl(search: string): number {
  const raw = new URLSearchParams(search).get("seed");
  const n = raw === null ? NaN : Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 1;
}

type Handler = (payload: unknown) => void;

export interface DemoChannel extends ChannelLike {
  /** Start the scenario clock. Returns the stop function. */
  start(): () => void;
}

interface DemoChannelOptions {
  seed: number;
  /** Test seam; defaults to the browser's visibility. */
  isHidden?: () => boolean;
}

export function createDemoChannel(opts: DemoChannelOptions): DemoChannel {
  const handlers = new Map<string, Handler[]>();
  const rand = mulberry32(opts.seed);
  const isHidden = opts.isHidden ?? (() => typeof document !== "undefined" && document.hidden);

  const emit = (table: string, payload: unknown) => {
    for (const h of handlers.get(`INSERT:${table}`) ?? []) h(payload);
  };

  const emitReview = () => {
    const pick = REVIEW_POOL[Math.floor(rand() * REVIEW_POOL.length)];
    const persona = MOCK_PERSONAS[Math.floor(rand() * MOCK_PERSONAS.length)];
    const now = new Date().toISOString();
    const event: PersonaEvent = {
      id: `ev-demo-review-${Math.floor(rand() * 1e9)}-mock`,
      projectId: "mock-project",
      eventType: "manual_review",
      sourceType: "execution",
      sourceId: null,
      targetPersonaId: persona.id,
      payload: JSON.stringify({ title: pick.title, description: pick.description, severity: pick.severity }),
      status: "pending",
      errorMessage: null,
      processedAt: null,
      useCaseId: null,
      createdAt: now,
      retryCount: 0,
    };
    MOCK_EVENTS.unshift(event);
    // A crew persona's new review also lands on its Board agent.
    notifyDemoFixtureChange();
    emit("synced_manual_reviews", {
      eventType: "INSERT",
      new: { id: event.id, status: "pending", title: pick.title, severity: pick.severity, persona_id: persona.id },
    });
  };

  const beats: { at: number; run: () => void }[] = [{ at: FIRST_REVIEW_AT_MS, run: emitReview }];

  return {
    on(_type, filter, callback) {
      const key = `${filter.event}:${filter.table}`;
      handlers.set(key, [...(handlers.get(key) ?? []), callback]);
      return this;
    },
    start() {
      let elapsed = 0;
      let next = 0;
      const timer = setInterval(() => {
        if (!resolveTicker({ stillPreferred: false, tabHidden: isHidden(), inView: null }).run) return;
        elapsed += TICK_MS;
        while (next < beats.length && beats[next].at <= elapsed) beats[next++].run();
      }, TICK_MS);
      return () => clearInterval(timer);
    },
  };
}

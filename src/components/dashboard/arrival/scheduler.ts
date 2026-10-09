/**
 * The T3 ("deep") release queue — see docs/features/dashboard/loading-orchestration.md.
 *
 * A view paints its frame (T0), its section chrome (T1) and its primary data
 * (T2) at once. Everything heavy or nested below that (charts, graphs,
 * secondary panels) waits here and is released one slot at a time: first
 * `FIRST_LEAD_MS` after the view's first paint, then one slot per `SLOT_GAP_MS`,
 * each inside an idle callback so a release never lands on top of input or a
 * frame in flight. Lower `order` goes first; ties keep registration order
 * (which is document order, because sibling effects run in tree order).
 *
 * Fetching is NOT what waits: a slot can start its chunk download the moment
 * it mounts (`Deferred`'s `preload`). Only the mount — the main-thread work —
 * is spread out.
 */

/** Quiet time after the view's first paint before the first deep slot. */
export const FIRST_LEAD_MS = 120;
/** Minimum spacing between two deep releases. */
export const SLOT_GAP_MS = 90;
/** An idle callback is a preference, not a promise: release anyway after this. */
const IDLE_TIMEOUT_MS = 300;

interface Waiter {
  order: number;
  seq: number;
  release: () => void;
}

type IdleHandle = { cancel: () => void };

function whenIdle(run: () => void): IdleHandle {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const id = window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
    return { cancel: () => window.cancelIdleCallback(id) };
  }
  const id = setTimeout(run, 16);
  return { cancel: () => clearTimeout(id) };
}

export class ArrivalQueue {
  private waiting: Waiter[] = [];
  private seq = 0;
  private open = false;
  private lastRelease = 0;
  private gapTimer: ReturnType<typeof setTimeout> | null = null;
  private idle: IdleHandle | null = null;

  /** Queue a slot; returns a cancel function (unmount / hide before release). */
  enqueue(order: number, release: () => void): () => void {
    const waiter: Waiter = { order, seq: this.seq++, release };
    this.waiting.push(waiter);
    this.pump();
    return () => {
      this.waiting = this.waiting.filter((w) => w !== waiter);
    };
  }

  /**
   * The view has painted (passive effects run after the browser paints the
   * commit that mounted it): start releasing after the lead.
   */
  openAfterPaint(): () => void {
    const lead = setTimeout(() => {
      this.open = true;
      this.lastRelease = performance.now() - SLOT_GAP_MS;
      this.pump();
    }, FIRST_LEAD_MS);
    return () => {
      clearTimeout(lead);
      this.close();
    };
  }

  /** The view was hidden: stop releasing, keep the queue. */
  close() {
    this.open = false;
    if (this.gapTimer) clearTimeout(this.gapTimer);
    this.gapTimer = null;
    this.idle?.cancel();
    this.idle = null;
  }

  private pump() {
    if (!this.open || this.gapTimer || this.idle || this.waiting.length === 0) return;
    const wait = Math.max(0, this.lastRelease + SLOT_GAP_MS - performance.now());
    this.gapTimer = setTimeout(() => {
      this.gapTimer = null;
      this.idle = whenIdle(() => {
        this.idle = null;
        const next = this.takeNext();
        if (!next) return;
        this.lastRelease = performance.now();
        next.release();
        this.pump();
      });
    }, wait);
  }

  private takeNext(): Waiter | undefined {
    if (this.waiting.length === 0) return undefined;
    let best = 0;
    for (let i = 1; i < this.waiting.length; i++) {
      const w = this.waiting[i];
      const b = this.waiting[best];
      if (w.order < b.order || (w.order === b.order && w.seq < b.seq)) best = i;
    }
    return this.waiting.splice(best, 1)[0];
  }
}

/**
 * Used when a deep slot renders outside a view's provider (tests, a component
 * reused off the dashboard). It opens on first use, so nothing waits forever.
 */
let fallback: ArrivalQueue | null = null;
export function fallbackQueue(): ArrivalQueue {
  if (!fallback) {
    fallback = new ArrivalQueue();
    if (typeof window !== "undefined") fallback.openAfterPaint();
  }
  return fallback;
}

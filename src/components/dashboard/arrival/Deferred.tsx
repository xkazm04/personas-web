"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useArrivalQueue } from "./ArrivalProvider";

/** How far outside the viewport a deep slot may still queue for release. */
const NEAR_MARGIN = "300px 0px";

/**
 * True once this deep (T3) slot has been released by the view's queue. A slot
 * queues only once it is near the viewport, so below-the-fold work waits for
 * the scroll that needs it. Release is mount-once: the state survives an
 * `<Activity>` hide, so a warm return never re-defers.
 */
export function useDeepTurn(ref: RefObject<Element | null>, order = 0): boolean {
  const queue = useArrivalQueue();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const el = ref.current;
    let cancelQueue: (() => void) | null = null;
    const enqueue = () => {
      cancelQueue ??= queue.enqueue(order, () => setReady(true));
    };
    if (!el || typeof IntersectionObserver === "undefined") {
      enqueue();
      return () => cancelQueue?.();
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          enqueue();
        }
      },
      { rootMargin: NEAR_MARGIN },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelQueue?.();
    };
  }, [queue, ready, ref, order]);

  return ready;
}

/**
 * A deep (T3) slot: reserves its space at once, starts its code download at
 * once (`preload`), and mounts its children only when the view's arrival queue
 * releases it — then fades them in (`.dash-settle`).
 *
 * The slot's chrome (card border, title, toolbar) belongs OUTSIDE this
 * component and paints with the view. Put only the heavy body inside.
 *
 * - `minHeight` is the body's real height: the reservation is what keeps the
 *   page still when the body lands. It stays applied after release (it is a
 *   floor, not a size), so a body whose own chunk is still loading cannot
 *   collapse the slot.
 * - `ghost` (optional) is drawn only after the ghost delay — warm loads never
 *   see it. Omit it unless you can promise the body's real geometry.
 */
export default function Deferred({
  children,
  minHeight,
  order = 0,
  preload,
  ghost,
  className,
}: {
  children: ReactNode;
  minHeight: number | string;
  order?: number;
  preload?: () => unknown;
  ghost?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const ready = useDeepTurn(ref, order);

  // Fetch early, mount late: the chunk downloads while the frame paints.
  const preloadRef = useRef(preload);
  useEffect(() => {
    const run = preloadRef.current;
    if (!run) return;
    void Promise.resolve()
      .then(run)
      .catch(() => {
        // A failed warm-up is harmless: the real mount retries and surfaces errors.
      });
  }, []);

  return (
    <div
      ref={ref}
      className={`${className ?? ""}${ready ? " dash-settle" : ""}`}
      style={{ minHeight }}
      aria-busy={ready ? undefined : true}
    >
      {ready ? children : ghost ? <div aria-hidden className="dash-ghost">{ghost}</div> : null}
    </div>
  );
}

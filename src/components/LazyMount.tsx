"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Viewport-gate: reserves vertical space and only mounts its children once they
 * scroll within ~1 viewport of the visible area (mount-once). Pairs with
 * `next/dynamic` sections so a section's chunk isn't fetched/hydrated until you
 * approach it — spreading load across scroll instead of a "big bang" at first
 * paint. Trades a slightly later pop-in (the `rootMargin` lead aims to have it
 * ready by the time it's reached) for steadier loading.
 *
 * SSR-safe: renders the same placeholder on the server and the first client
 * render (no hydration mismatch), then swaps to children on intersect. Reserved
 * `minHeight` prevents layout shift and keeps scroll-map anchors meaningful; the
 * optional `label` stays in the static HTML for crawlers.
 */
export default function LazyMount({
  children,
  minHeight = 600,
  rootMargin = "800px 0px",
  label,
  className,
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No IO (very old browsers): reveal on the next tick rather than
      // synchronously, so this stays out of the effect's synchronous body.
      const id = setTimeout(() => setShown(true), 0);
      return () => clearTimeout(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {shown ? (
        children
      ) : (
        <div
          className="flex items-center justify-center px-6"
          style={{ minHeight }}
        >
          {label && (
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-dark/70">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Render function called each frame for a registered canvas layer.
 * The compositor clears the canvas before calling render.
 */
export type LayerRenderFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  elapsed: number,
) => void;

/** Called after canvas resize so layers can reinitialize state. */
export type LayerResizeFn = (w: number, h: number) => void;

// ── Singleton compositor state ──

interface Registration {
  canvas: HTMLCanvasElement;
  render: LayerRenderFn;
  onResize?: LayerResizeFn;
  inView: boolean;
}

const registrations = new Map<symbol, Registration>();
// Element-keyed indexes so observer callbacks are O(1) per entry instead of
// scanning every registration. A canvas owns exactly one registration; a
// parent element may host more than one canvas.
const byCanvas = new Map<HTMLCanvasElement, Registration>();
const byParent = new Map<Element, Set<Registration>>();
let rafId = 0;
let startTime = 0;
let intersectionObserver: IntersectionObserver | null = null;
let resizeObserver: ResizeObserver | null = null;

function anyInView(): boolean {
  for (const entry of registrations.values()) {
    if (entry.inView) return true;
  }
  return false;
}

function tick(now: number) {
  // Stop loop entirely when all canvases are off-screen or tab is hidden
  if (!anyInView() || document.hidden) {
    rafId = 0;
    return;
  }

  if (startTime === 0) startTime = now;
  const elapsed = (now - startTime) / 1000;

  const dpr = window.devicePixelRatio || 1;
  for (const entry of registrations.values()) {
    if (!entry.inView) continue;
    const ctx = entry.canvas.getContext("2d");
    if (!ctx) continue;
    const w = entry.canvas.width / dpr;
    const h = entry.canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    entry.render(ctx, w, h, elapsed);
    ctx.globalAlpha = 1;
  }

  if (registrations.size > 0) {
    rafId = requestAnimationFrame(tick);
  }
}

function startLoop() {
  if (rafId === 0 && registrations.size > 0) {
    rafId = requestAnimationFrame(tick);
  }
}

function stopLoop() {
  if (rafId !== 0) {
    cancelAnimationFrame(rafId);
    rafId = 0;
    startTime = 0;
  }
}

function getIntersectionObserver(): IntersectionObserver {
  if (!intersectionObserver) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const io of entries) {
          const reg = byCanvas.get(io.target as HTMLCanvasElement);
          if (reg) reg.inView = io.isIntersecting;
        }
        // Restart loop if a canvas came into view while loop was stopped
        if (rafId === 0 && anyInView()) {
          startLoop();
        }
      },
      { threshold: 0.1 },
    );
  }
  return intersectionObserver;
}

function getResizeObserver(): ResizeObserver {
  if (!resizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      // ResizeObserver already batches, but RAF ensures we stay in sync with display
      requestAnimationFrame(() => {
        for (const entry of entries) {
          const regs = byParent.get(entry.target);
          if (!regs) continue;
          const { width, height } = entry.contentRect;
          for (const reg of regs) {
            applyCanvasSize(reg.canvas, width, height);
            reg.onResize?.(width, height);
          }
        }
      });
    });
  }
  return resizeObserver;
}

function applyCanvasSize(canvas: HTMLCanvasElement, cssW: number, cssH: number) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ── Public hook ──

/**
 * Registers a canvas element with the global compositor.
 * The compositor runs a single RAF loop shared across all registered canvases,
 * a single IntersectionObserver for visibility, and a single ResizeObserver
 * for responsive sizing.
 *
 * @param canvasRef - Ref to the canvas element
 * @param render - Called each frame (canvas is pre-cleared)
 * @param options.onResize - Called after canvas resize
 * @param options.enabled - Set false to skip registration (e.g. reduced motion)
 */
export function useCanvasCompositor(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  render: LayerRenderFn,
  options?: {
    onResize?: LayerResizeFn;
    enabled?: boolean;
  },
) {
  const renderRef = useRef(render);
  const onResizeRef = useRef(options?.onResize);
  useEffect(() => {
    renderRef.current = render;
    onResizeRef.current = options?.onResize;
  });

  const reduced = useReducedMotion();
  const enabled = (options?.enabled ?? true) && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const key = Symbol();
    const parent = canvas.parentElement;

    // Initial sizing
    if (parent) {
      const rect = parent.getBoundingClientRect();
      applyCanvasSize(canvas, rect.width, rect.height);
      onResizeRef.current?.(rect.width, rect.height);
    }

    const registration: Registration = {
      canvas,
      render: (ctx, w, h, elapsed) => renderRef.current(ctx, w, h, elapsed),
      onResize: (w, h) => onResizeRef.current?.(w, h),
      inView: false,
    };

    registrations.set(key, registration);
    byCanvas.set(canvas, registration);
    if (parent) {
      let set = byParent.get(parent);
      if (!set) {
        set = new Set();
        byParent.set(parent, set);
      }
      set.add(registration);
    }
    // Capture the observer references at mount time. If we instead called
    // the lazy getters from cleanup, an interleaved teardown could find
    // `intersectionObserver === null` and the getter would synthesize a
    // brand-new observer just to call `.unobserve()` on it — that fresh
    // observer would then be leaked when the same cleanup's "size === 0"
    // branch ran a `disconnect()` on it after also re-running its
    // creation path. By holding a local ref, cleanup unobserves only the
    // real observer this mount registered with, and skips entirely if
    // that observer has already been disconnected by a sibling teardown.
    const ioRef = getIntersectionObserver();
    ioRef.observe(canvas);
    let parentRoRef: ResizeObserver | null = null;
    if (parent) {
      parentRoRef = getResizeObserver();
      parentRoRef.observe(parent);
    }

    startLoop();

    return () => {
      registrations.delete(key);
      byCanvas.delete(canvas);
      // Use the captured ref. Skip if the singleton has already been
      // torn down by a peer cleanup running ahead of us in the same
      // teardown batch.
      if (ioRef === intersectionObserver) {
        ioRef.unobserve(canvas);
      }
      if (parent) {
        const set = byParent.get(parent);
        if (set) {
          set.delete(registration);
          if (set.size === 0) {
            byParent.delete(parent);
            // Only stop observing the parent when no other canvas under
            // it is still registered, otherwise siblings would lose
            // ResizeObserver updates.
            if (parentRoRef && parentRoRef === resizeObserver) {
              parentRoRef.unobserve(parent);
            }
          }
        }
      }

      if (registrations.size === 0) {
        stopLoop();
        intersectionObserver?.disconnect();
        intersectionObserver = null;
        resizeObserver?.disconnect();
        resizeObserver = null;
      }
    };
  }, [canvasRef, enabled]);
}

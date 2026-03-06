"use client";

import { useEffect, useRef } from "react";

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

const entries = new Map<symbol, Registration>();
let rafId = 0;
let startTime = 0;
let observer: IntersectionObserver | null = null;
let resizeAttached = false;
let resizeTimeoutId: ReturnType<typeof setTimeout> | null = null;
const debouncedResizeHandler = () => {
  if (resizeTimeoutId) clearTimeout(resizeTimeoutId);
  resizeTimeoutId = setTimeout(() => {
    handleResize();
    resizeTimeoutId = null;
  }, 120);
};

function tick(now: number) {
  if (startTime === 0) startTime = now;
  const elapsed = (now - startTime) / 1000;

  const dpr = window.devicePixelRatio || 1;
  for (const entry of entries.values()) {
    if (!entry.inView) continue;
    const ctx = entry.canvas.getContext("2d");
    if (!ctx) continue;
    // Pass CSS dimensions — the context transform handles DPR scaling
    const w = entry.canvas.width / dpr;
    const h = entry.canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    entry.render(ctx, w, h, elapsed);
    ctx.globalAlpha = 1;
  }

  if (entries.size > 0) {
    rafId = requestAnimationFrame(tick);
  }
}

function startLoop() {
  if (rafId === 0 && entries.size > 0) {
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

function getObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (ioEntries) => {
        for (const io of ioEntries) {
          for (const reg of entries.values()) {
            if (reg.canvas === io.target) {
              reg.inView = io.isIntersecting;
            }
          }
        }
      },
      { threshold: 0.1 },
    );
  }
  return observer;
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

function handleResize() {
  for (const entry of entries.values()) {
    const parent = entry.canvas.parentElement;
    if (!parent) continue;
    const rect = parent.getBoundingClientRect();
    applyCanvasSize(entry.canvas, rect.width, rect.height);
    entry.onResize?.(rect.width, rect.height);
  }
}

// ── Public hook ──

/**
 * Registers a canvas element with the global compositor.
 * The compositor runs a single RAF loop shared across all registered canvases,
 * a single IntersectionObserver for visibility, and a single resize handler.
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
  renderRef.current = render;
  const onResizeRef = useRef(options?.onResize);
  onResizeRef.current = options?.onResize;

  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const key = Symbol();

    // Initial sizing (HiDPI-aware)
    const parent = canvas.parentElement;
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

    entries.set(key, registration);
    getObserver().observe(canvas);

    if (!resizeAttached) {
      window.addEventListener("resize", debouncedResizeHandler);
      resizeAttached = true;
    }

    startLoop();

    return () => {
      entries.delete(key);
      getObserver().unobserve(canvas);

      if (entries.size === 0) {
        stopLoop();
        observer?.disconnect();
        observer = null;
        if (resizeAttached) {
          window.removeEventListener("resize", debouncedResizeHandler);
          if (resizeTimeoutId) {
            clearTimeout(resizeTimeoutId);
            resizeTimeoutId = null;
          }
          resizeAttached = false;
        }
      }
    };
  }, [canvasRef, enabled]);
}

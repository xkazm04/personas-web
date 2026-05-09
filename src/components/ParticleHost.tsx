"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotionPreference } from "@/contexts/QualityContext";

export interface HostRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ParticleLayerRender = (
  ctx: CanvasRenderingContext2D,
  hostRect: HostRect,
  elapsed: number,
) => void;

/**
 * Physics-only tick: integrate particle positions, no canvas writes.
 * Runs only when the layer is in view, before its render() call. Splits
 * "compute" from "paint" so a single off-screen layer in a multi-layer
 * page pays zero cost — neither physics nor draw runs.
 */
export type ParticleLayerUpdate = (
  hostRect: HostRect,
  elapsed: number,
  delta: number,
) => void;

export type ParticleLayerResize = (rect: HostRect) => void;

interface Layer {
  hostEl: HTMLElement;
  render: ParticleLayerRender;
  update?: ParticleLayerUpdate;
  onResize?: ParticleLayerResize;
  inView: boolean;
}

// ── Singleton host state ──

const layers = new Map<symbol, Layer>();
let canvasEl: HTMLCanvasElement | null = null;
let viewportW = 0;
let viewportH = 0;
let rafId = 0;
let startTime = 0;
let lastFrameTime = 0;
let intersectionObserver: IntersectionObserver | null = null;
let resizeObserver: ResizeObserver | null = null;

function rectOf(el: HTMLElement): HostRect {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

function anyInView(): boolean {
  for (const layer of layers.values()) {
    if (layer.inView) return true;
  }
  return false;
}

function tick(now: number) {
  if (!canvasEl || !anyInView() || document.hidden) {
    rafId = 0;
    lastFrameTime = 0;
    return;
  }

  if (startTime === 0) startTime = now;
  const elapsed = (now - startTime) / 1000;
  const delta = lastFrameTime === 0 ? 0 : (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  const ctx = canvasEl.getContext("2d");
  if (!ctx) {
    rafId = 0;
    return;
  }

  // ONE clearRect per frame, for the entire viewport.
  ctx.clearRect(0, 0, viewportW, viewportH);

  for (const layer of layers.values()) {
    // Skip BOTH physics and draw for off-screen layers — physics is no
    // longer baked into the render closure, so a layer being out-of-view
    // costs nothing this frame regardless of how many other layers
    // are still active.
    if (!layer.inView) continue;
    const rect = rectOf(layer.hostEl);
    layer.update?.(rect, elapsed, delta);
    layer.render(ctx, rect, elapsed);
    ctx.globalAlpha = 1;
  }

  rafId = layers.size > 0 ? requestAnimationFrame(tick) : 0;
}

function startLoop() {
  if (rafId === 0 && canvasEl && anyInView()) {
    rafId = requestAnimationFrame(tick);
  }
}

function applyCanvasSize() {
  if (!canvasEl) return;
  viewportW = window.innerWidth;
  viewportH = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  canvasEl.width = viewportW * dpr;
  canvasEl.height = viewportH * dpr;
  canvasEl.style.width = `${viewportW}px`;
  canvasEl.style.height = `${viewportH}px`;
  const ctx = canvasEl.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Notify layers in case viewport-relative host bounds changed.
  for (const layer of layers.values()) {
    layer.onResize?.(rectOf(layer.hostEl));
  }
}

function getIntersectionObserver(): IntersectionObserver {
  if (!intersectionObserver) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const io of entries) {
          for (const layer of layers.values()) {
            if (layer.hostEl === io.target) {
              layer.inView = io.isIntersecting;
            }
          }
        }
        if (rafId === 0) startLoop();
      },
      { threshold: 0.01 },
    );
  }
  return intersectionObserver;
}

function getResizeObserver(): ResizeObserver {
  if (!resizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        for (const entry of entries) {
          for (const layer of layers.values()) {
            if (layer.hostEl === entry.target) {
              layer.onResize?.(rectOf(layer.hostEl));
            }
          }
        }
      });
    });
  }
  return resizeObserver;
}

/**
 * Single full-viewport canvas that hosts all registered particle layers.
 * Mount once near the top of the page tree (e.g. inside PageShell's <main>).
 *
 * Uses one RAF loop, one clearRect/frame, and one IntersectionObserver +
 * ResizeObserver pair shared across all layers.
 */
export function ParticleHost() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvasEl = canvas;
    applyCanvasSize();
    const handleResize = () => applyCanvasSize();
    window.addEventListener("resize", handleResize);

    startLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
        startTime = 0;
        lastFrameTime = 0;
      }
      canvasEl = null;
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
    />
  );
}

/**
 * Registers a particle layer with the global ParticleHost canvas.
 * The layer's render fn is invoked each frame with the host element's
 * current viewport rect; use it to translate particle positions into
 * viewport coordinates.
 *
 * @param hostRef - Element whose bounds anchor the layer (typically a
 *   placeholder `<div absolute inset-0>` inside the visual section).
 * @param render - Per-frame render callback.
 * @param options.onResize - Called on register and when the host resizes.
 * @param options.enabled - Skip registration when false (e.g. low quality).
 */
export function useParticleLayer(
  hostRef: RefObject<HTMLElement | null>,
  render: ParticleLayerRender,
  options?: {
    update?: ParticleLayerUpdate;
    onResize?: ParticleLayerResize;
    enabled?: boolean;
  },
) {
  const renderRef = useRef(render);
  const updateRef = useRef(options?.update);
  const onResizeRef = useRef(options?.onResize);

  useEffect(() => {
    renderRef.current = render;
    updateRef.current = options?.update;
    onResizeRef.current = options?.onResize;
  }, [render, options?.update, options?.onResize]);

  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;
    const el = hostRef.current;
    if (!el) return;

    const key = Symbol();
    const layer: Layer = {
      hostEl: el,
      render: (ctx, rect, elapsed) => renderRef.current(ctx, rect, elapsed),
      update: (rect, elapsed, delta) =>
        updateRef.current?.(rect, elapsed, delta),
      onResize: (rect) => onResizeRef.current?.(rect),
      inView: false,
    };

    layers.set(key, layer);
    layer.onResize?.(rectOf(el));
    getIntersectionObserver().observe(el);
    getResizeObserver().observe(el);

    startLoop();

    return () => {
      layers.delete(key);
      intersectionObserver?.unobserve(el);
      resizeObserver?.unobserve(el);
    };
  }, [hostRef, enabled]);
}

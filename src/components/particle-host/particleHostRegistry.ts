/* eslint-disable custom-animation/require-animation-gating -- The React ParticleHost wrapper gates this registry with useReducedMotionPreference before mounting the canvas or registering layers. */

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

const layers = new Map<symbol, Layer>();
const byHostEl = new Map<HTMLElement, Set<Layer>>();
let canvasEl: HTMLCanvasElement | null = null;
let viewportW = 0;
let viewportH = 0;
let rafId = 0;
let startTime = 0;
let lastFrameTime = 0;
let intersectionObserver: IntersectionObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let mountCount = 0;

function rectOf(el: HTMLElement): HostRect {
  const rect = el.getBoundingClientRect();
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
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

  ctx.clearRect(0, 0, viewportW, viewportH);

  for (const layer of layers.values()) {
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

  for (const layer of layers.values()) {
    layer.onResize?.(rectOf(layer.hostEl));
  }
}

function getIntersectionObserver(): IntersectionObserver {
  if (!intersectionObserver) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const set = byHostEl.get(entry.target as HTMLElement);
          if (!set) continue;
          for (const layer of set) {
            layer.inView = entry.isIntersecting;
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
          const set = byHostEl.get(entry.target as HTMLElement);
          if (!set) continue;
          const rect = rectOf(entry.target as HTMLElement);
          for (const layer of set) {
            layer.onResize?.(rect);
          }
        }
      });
    });
  }
  return resizeObserver;
}

export function mountParticleCanvas(canvas: HTMLCanvasElement): () => void {
  mountCount += 1;
  if (mountCount > 1) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[ParticleHost] Multiple ParticleHost instances mounted - only the first is active. " +
          "Mount it once near the top of the page tree.",
      );
    }
    return () => {
      mountCount = Math.max(0, mountCount - 1);
    };
  }

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
    mountCount = Math.max(0, mountCount - 1);
  };
}

export function registerParticleLayer({
  hostEl,
  render,
  update,
  onResize,
}: {
  hostEl: HTMLElement;
  render: ParticleLayerRender;
  update?: ParticleLayerUpdate;
  onResize?: ParticleLayerResize;
}): () => void {
  const key = Symbol();
  const layer: Layer = { hostEl, render, update, onResize, inView: false };

  layers.set(key, layer);
  let set = byHostEl.get(hostEl);
  if (!set) {
    set = new Set();
    byHostEl.set(hostEl, set);
  }
  set.add(layer);
  layer.onResize?.(rectOf(hostEl));
  getIntersectionObserver().observe(hostEl);
  getResizeObserver().observe(hostEl);
  startLoop();

  return () => {
    layers.delete(key);
    const layerSet = byHostEl.get(hostEl);
    if (!layerSet) return;
    layerSet.delete(layer);
    if (layerSet.size === 0) {
      byHostEl.delete(hostEl);
      intersectionObserver?.unobserve(hostEl);
      resizeObserver?.unobserve(hostEl);
    }
  };
}

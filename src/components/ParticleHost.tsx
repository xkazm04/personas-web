"use client";

import { useEffect, useRef, type RefObject } from "react";

import { useReducedMotionPreference } from "@/contexts/QualityContext";

import {
  mountParticleCanvas,
  registerParticleLayer,
  type HostRect,
  type ParticleLayerRender,
  type ParticleLayerResize,
  type ParticleLayerUpdate,
} from "./particle-host/particleHostRegistry";

export type {
  HostRect,
  ParticleLayerRender,
  ParticleLayerResize,
  ParticleLayerUpdate,
};

export function ParticleHost() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    return mountParticleCanvas(canvas);
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
    const hostEl = hostRef.current;
    if (!hostEl) return;

    return registerParticleLayer({
      hostEl,
      render: (ctx, rect, elapsed) => renderRef.current(ctx, rect, elapsed),
      update: (rect, elapsed, delta) =>
        updateRef.current?.(rect, elapsed, delta),
      onResize: (rect) => onResizeRef.current?.(rect),
    });
  }, [hostRef, enabled]);
}

"use client";

import { useEffect, useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";
import { useQualityTier } from "@/contexts/QualityContext";
import { SignalEngine } from "./engine";
import { drawScene } from "./draw";
import { readPalette, type Palette } from "./palette";

const DUST: Record<string, number> = { high: 170, medium: 90, low: 40 };

/**
 * The A1 canvas. Reduced motion renders one settled, mid-flight frame; otherwise
 * the loop runs only while the tab is foregrounded and the hero is on screen.
 */
export default function SignalCanvas({ label }: { label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SignalEngine | null>(null);
  const palRef = useRef<Palette | null>(null);
  const still = useStillMotion();
  const visible = useIsVisible(wrapRef);
  const tier = useQualityTier();
  const running = !still && visible;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;
    const engine = new SignalEngine(DUST[tier] ?? DUST.high);
    engineRef.current = engine;
    palRef.current = readPalette(wrap);
    let settled = false;
    const paint = () => {
      if (palRef.current) drawScene(ctx, engine, palRef.current);
    };
    const fit = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.resize(w, h);
      if (still) {
        if (!settled) engine.warm(7);
        settled = true;
      }
      paint();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    const mo = new MutationObserver(() => {
      palRef.current = readPalette(wrap);
      paint();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
      engineRef.current = null;
    };
  }, [still, tier]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!running || !wrap || !ctx) return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const engine = engineRef.current;
      const pal = palRef.current;
      if (engine && pal) {
        engine.step((now - last) / 1000);
        drawScene(ctx, engine, pal);
      }
      last = now;
      raf = requestAnimationFrame(frame);
    };
    const onMove = (ev: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const engine = engineRef.current;
      if (engine) engine.pointer = { x: ev.clientX - r.left, y: ev.clientY - r.top };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [running]);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0" role="img" aria-label={label}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useTour } from "@/contexts/TourContext";

/**
 * Athena — the tour's companion avatar. Layer A is her looping idle video;
 * Layer B is an audio-reactive canvas that blooms her chest-core glow and
 * opens a soft mouth in time with the narration voice (tapped from the tour's
 * shared AnalyserNode). Falls back to a gentle idle breath when no voice is
 * playing, and to a static frame under prefers-reduced-motion.
 *
 * The source frame is square and volumetric (see the desktop companion doc),
 * so we render it square and address features by normalized anchors:
 *   chest core ≈ (0.50, 0.71), mouth ≈ (0.50, 0.52).
 */
const CORE = { x: 0.5, y: 0.71 };
const MOUTH = { x: 0.5, y: 0.52 };

export default function AthenaCompanion({
  size = 96,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const { audioAnalyser } = useTour();
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const bins = audioAnalyser ? new Uint8Array(audioAnalyser.frequencyBinCount) : null;
    let raf = 0;
    let smooth = 0;
    const start = performance.now();

    const frame = (t: number) => {
      // Voice level (0..1) from the low–mid bands, or 0 when silent/no audio.
      let level = 0;
      if (audioAnalyser && bins) {
        audioAnalyser.getByteFrequencyData(bins);
        const n = Math.min(bins.length, 32);
        let sum = 0;
        for (let i = 2; i < n; i++) sum += bins[i];
        level = Math.min(1, sum / (n - 2) / 180);
      }
      // Gentle idle breath so she's never fully static.
      const idle = 0.12 + 0.06 * Math.sin((t - start) / 900);
      const target = Math.max(level, idle);
      smooth += (target - smooth) * 0.25;

      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = "lighter";

      // Chest-core bloom.
      const cx = CORE.x * size;
      const cy = CORE.y * size;
      const r = size * (0.12 + smooth * 0.34);
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      core.addColorStop(0, `rgba(94, 234, 255, ${0.5 * smooth + 0.12})`);
      core.addColorStop(0.5, `rgba(34, 211, 238, ${0.22 * smooth})`);
      core.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Mouth — a soft glow that opens vertically with the voice.
      const mx = MOUTH.x * size;
      const my = MOUTH.y * size;
      const mw = size * 0.07;
      const mh = size * (0.012 + smooth * 0.05);
      const mouth = ctx.createRadialGradient(mx, my, 0, mx, my, mw);
      mouth.addColorStop(0, `rgba(165, 243, 252, ${0.35 * smooth + 0.05})`);
      mouth.addColorStop(1, "rgba(165, 243, 252, 0)");
      ctx.fillStyle = mouth;
      ctx.beginPath();
      ctx.ellipse(mx, my, mw, mh, 0, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [audioAnalyser, prefersReducedMotion, size]);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-cyan/30 bg-brand-cyan/5 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <video
        src="/athena/athena_idle_loop.mp4"
        poster="/athena/athena_baseline.jpg"
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ width: size, height: size }}
      />
    </span>
  );
}

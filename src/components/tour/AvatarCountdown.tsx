"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { INTRO_START_DELAY_MS } from "@/hooks/useTourAudio";

/**
 * Countdown that fills the Athena avatar during the pre-speech beat of the
 * homepage tour intro: a draining ring + 4→3→2→1 numbers that scale/blur
 * through each other, ending right as the greeting begins. Each second blips a
 * short Web Audio tick (no asset), scaled by the tour volume and pitched up on
 * the final tick. Driven by the same INTRO_START_DELAY_MS the audio waits on.
 */
export default function AvatarCountdown({
  size,
  volume,
  durationMs = INTRO_START_DELAY_MS,
}: {
  size: number;
  volume: number;
  durationMs?: number;
}) {
  const reduced = useReducedMotion();
  const total = Math.max(1, Math.ceil(durationMs / 1000));
  const [count, setCount] = useState(total);

  const volRef = useRef(volume);
  useEffect(() => {
    volRef.current = volume;
  }, [volume]);
  const ctxRef = useRef<AudioContext | null>(null);

  const blip = useCallback((final: boolean) => {
    const v = volRef.current;
    if (v <= 0) return;
    try {
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(final ? 1320 : 740, now);
      const peak = Math.min(0.16, 0.12 * v + 0.02);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (final ? 0.3 : 0.16));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (final ? 0.34 : 0.18));
    } catch {
      /* no Web Audio — countdown stays silent */
    }
  }, []);

  useEffect(
    () => () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    },
    [],
  );

  // 1s cadence derived from elapsed time (not setInterval) so it can't drift or
  // double-tick under StrictMode/remounts: 4 → 3 → 2 → 1 → 0 (0 = hide).
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let last = total;
    const loop = (now: number) => {
      const elapsed = now - start;
      const remaining = Math.max(0, total - Math.floor(elapsed / 1000));
      if (remaining !== last) {
        last = remaining;
        setCount(remaining);
      }
      if (elapsed < durationMs) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [total, durationMs]);

  // Blip on each visible number, including the first; higher pitch on the last.
  useEffect(() => {
    if (count > 0) blip(count === 1);
  }, [count, blip]);

  const r = size * 0.42;
  const circumference = 2 * Math.PI * r;
  const stroke = Math.max(2, size * 0.035);
  const half = size / 2;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          {/* Readability veil over the idle video */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(6,10,18,0.74) 0%, rgba(6,10,18,0.5) 62%, rgba(6,10,18,0.18) 100%)",
            }}
          />

          {/* Draining progress ring */}
          <svg
            className="absolute inset-0"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            <circle
              cx={half}
              cy={half}
              r={r}
              fill="none"
              stroke="rgba(94,234,255,0.14)"
              strokeWidth={stroke}
            />
            <motion.circle
              cx={half}
              cy={half}
              r={r}
              fill="none"
              stroke="rgba(94,234,255,0.9)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              transform={`rotate(-90 ${half} ${half})`}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: reduced ? 0 : circumference }}
              transition={{ duration: reduced ? 0 : durationMs / 1000, ease: "linear" }}
              style={{ filter: "drop-shadow(0 0 4px rgba(94,234,255,0.6))" }}
            />
          </svg>

          {/* Tick ping on each second */}
          {!reduced && (
            <motion.span
              key={`ping-${count}`}
              className="absolute rounded-full border border-brand-cyan/50"
              style={{ width: r * 1.5, height: r * 1.5 }}
              initial={{ scale: 0.7, opacity: 0.55 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}

          {/* The number — scales/blurs through each step */}
          <AnimatePresence>
            <motion.span
              key={count}
              className="absolute font-bold leading-none tabular-nums text-brand-cyan"
              style={{
                fontSize: size * 0.42,
                textShadow: "0 0 14px rgba(94,234,255,0.7)",
              }}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.4, filter: "blur(8px)" }
              }
              animate={
                reduced
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, filter: "blur(0px)" }
              }
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 1.7, filter: "blur(10px)" }
              }
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useCallback, useEffect, useRef } from "react";

/**
 * A short Web Audio tick (no asset) for the avatar countdown, scaled by the
 * tour volume and pitched up when `final`. The AudioContext is created on the
 * first blip and closed on unmount.
 */
export function useCountdownBlip(volume: number) {
  const volRef = useRef(volume);
  useEffect(() => {
    volRef.current = volume;
  }, [volume]);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    },
    [],
  );

  return useCallback((final: boolean) => {
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
}

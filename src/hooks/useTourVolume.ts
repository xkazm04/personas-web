"use client";

import { useCallback, useState } from "react";

const VOLUME_KEY = "personas-tour-volume";
// Narration plays quiet by default (half of the previous 0.5) — the autoplay
// greeting was too loud out of the gate. Users can raise it via the slider.
const DEFAULT_VOLUME = 0.25;

function readInitialVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    if (raw === null) return DEFAULT_VOLUME;
    const v = Number(raw);
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

/**
 * Tour narration volume state, persisted across sessions in localStorage.
 * Returns `[volume, setVolume]`; the setter clamps to [0, 1] and writes
 * through to storage (best-effort — silently ignored when blocked).
 */
export function useTourVolume(): readonly [number, (value: number) => void] {
  const [volume, setVolumeState] = useState<number>(() => readInitialVolume());
  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    setVolumeState(clamped);
    try {
      window.localStorage.setItem(VOLUME_KEY, String(clamped));
    } catch {
      /* localStorage may be blocked; the in-memory value still applies. */
    }
  }, []);
  return [volume, setVolume] as const;
}

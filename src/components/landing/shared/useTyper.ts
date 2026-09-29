"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";

/**
 * Types `text` into state one character at a time (`cps` characters a second).
 * Call `type(next)` to start over; a newer call cancels the one in flight.
 * Under reduced motion the whole string appears at once.
 */
export function useTyper(cps = 45) {
  const still = useStillMotion();
  const [shown, setShown] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const type = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        stop();
        if (still) {
          setShown(text);
          resolve();
          return;
        }
        setShown("");
        let i = 0;
        timer.current = setInterval(() => {
          i += 1;
          setShown(text.slice(0, i));
          if (i >= text.length) {
            stop();
            resolve();
          }
        }, 1000 / cps);
      }),
    [cps, still, stop],
  );

  useEffect(() => stop, [stop]);
  return { shown, type, stop };
}

"use client";

import { useEffect, useRef, useState } from "react";

const STAGE = "(min-width: 64rem) and (min-height: 37.5rem)";

/**
 * How far a wide layout should stretch vertically to fill its stage slot.
 *
 * The art is aspect-locked and the stage caps its width (stage.css,
 * `--stage-max-w`), so on a tall monitor a fixed-ratio frame would sit in the
 * middle of a slot with empty bands above and below it. Each wide layout is
 * therefore a function of `k` (its vertical stretch): positions and heights
 * scale by `k`, sizes that must stay round (her face, a dial, a key) do not.
 *
 * Measured only on the desktop stage, where the slot's height comes from the
 * stage (flex: 1 1 0, min-height 0) and never from the art - so there is no
 * feedback loop. Quantised to 0.05 so a resize does not re-lay the scene on
 * every pixel. Returns 1 (no stretch) off the stage and before measuring.
 */
export function useStretch(baseW: number, baseH: number, maxK = 1.4) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [k, setK] = useState(1);

  useEffect(() => {
    const slot = ref.current?.parentElement;
    if (!slot || typeof ResizeObserver === "undefined") return;
    const mq = window.matchMedia(STAGE);
    const measure = () => {
      const { width, height } = slot.getBoundingClientRect();
      if (!mq.matches || width <= 0 || height <= 0) return setK(1);
      const want = (height * baseW) / (width * baseH);
      const art = Math.min(width, height * (baseW / baseH));
      // Only stretch when the art is width-capped (it fills the slot's width).
      const capped = art >= width - 2;
      const next = capped ? Math.min(Math.max(want, 1), maxK) : 1;
      setK(Math.floor(next * 20) / 20);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(slot);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, [baseW, baseH, maxK]);

  return { ref, k };
}

"use client";

import { useEffect, useState } from "react";

/**
 * A value that fades out, swaps and fades back in (the winner's `.sw` beat): returns the value to
 * show and whether the swap is mid-fade. Under reduced motion the new value shows at once.
 */
export function useSwap<T>(value: T, delay: number, still: boolean): [T, boolean] {
  const [shown, setShown] = useState(value);
  const [target, setTarget] = useState(value);
  if (value !== target) setTarget(value);
  useEffect(() => {
    if (target === shown) return;
    const id = setTimeout(() => setShown(target), still ? 0 : delay);
    return () => clearTimeout(id);
  }, [target, shown, delay, still]);
  return still ? [value, false] : [shown, target !== shown];
}

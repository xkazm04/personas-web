"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrivalQueue, fallbackQueue } from "./scheduler";

const ArrivalContext = createContext<ArrivalQueue | null>(null);

/**
 * One release queue per dashboard view (ViewOutlet wraps each kept-alive view
 * in one). The queue opens two frames after the view's first paint and closes
 * while the view is hidden — `<Activity>` runs effect cleanups on hide and
 * re-runs them on reveal, so a hidden view never releases deep slots.
 */
export function ArrivalProvider({ children }: { children: ReactNode }) {
  const [queue] = useState(() => new ArrivalQueue());
  useEffect(() => queue.openAfterPaint(), [queue]);
  return <ArrivalContext.Provider value={queue}>{children}</ArrivalContext.Provider>;
}

export function useArrivalQueue(): ArrivalQueue {
  return useContext(ArrivalContext) ?? fallbackQueue();
}

"use client";

import dynamic from "next/dynamic";

/* Below-the-fold landing sections: client-only chunks, mounted by `LazyMount`
   as the reader approaches them (see `app/page.tsx`). The hero is imported
   statically so the first paint has real content. */
export const LazyRack = dynamic(() => import("./rack"), { ssr: false });
export const LazyConcepts = dynamic(() => import("./concepts"), { ssr: false });
export const LazySetup = dynamic(() => import("./setup"), { ssr: false });
export const LazyRuns = dynamic(() => import("./runs"), { ssr: false });
export const LazyTriggers = dynamic(() => import("./triggers"), { ssr: false });
export const LazyTeam = dynamic(() => import("./team"), { ssr: false });
export const LazyCompanion = dynamic(() => import("./companion"), { ssr: false });
export const LazyNoCloud = dynamic(() => import("./nocloud"), { ssr: false });
export const LazyDownload = dynamic(() => import("./download"), { ssr: false });

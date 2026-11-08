"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";
import { createPageViewCounter } from "@/lib/page-view-counter";
import { normalizePathname } from "@/lib/route-key";

export default function PageViewTracker() {
  const pathname = usePathname();
  const counter = useRef(createPageViewCounter(trackPageView));

  useEffect(() => {
    if (!pathname) return;
    counter.current.route(normalizePathname(pathname));
  }, [pathname]);

  // A Back/Forward return served from the back/forward cache re-runs no effect,
  // so the route effect above never sees it. See page-view-counter.ts.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => counter.current.pageShow(e);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  return null;
}

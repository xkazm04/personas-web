"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";
import { normalizePathname } from "@/lib/route-key";

export default function PageViewTracker() {
  const pathname = usePathname();
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const normalized = normalizePathname(pathname);
    if (normalized !== tracked.current) {
      tracked.current = normalized;
      trackPageView(normalized);
    }
  }, [pathname]);

  return null;
}

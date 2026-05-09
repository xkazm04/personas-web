"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";
import { scrubPii } from "@/lib/sentry-pii";

const UUID_SEGMENT_RE =
  /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?=\/|$)/g;

function normalizePathname(pathname: string): string {
  return scrubPii(pathname.replace(UUID_SEGMENT_RE, "/:id"));
}

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

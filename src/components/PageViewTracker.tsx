"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";

export default function PageViewTracker() {
  const pathname = usePathname();
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== tracked.current) {
      tracked.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}

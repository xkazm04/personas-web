"use client";

import { useEffect } from "react";
import { describeAnchorGaps, findAnchorGaps } from "@/lib/anchor-coverage";

/**
 * Development-only: after first paint, assert every declared address has a host
 * in the LIVE document and every `data-scroll-anchor` wrapper is declared. Warns
 * (never throws) and does nothing in production. Runs from PageShell, where the
 * wrappers are already in the document unconditionally, so it never races lazy
 * content: "absent" is a real answer, not a timing artefact.
 */
export function useAnchorCoverageGuard(ids: readonly string[], consumer: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const frame = window.setTimeout(() => {
      const hosts = (id: string) =>
        document.getElementById(id) !== null ||
        document.querySelector(`[data-scroll-anchor="${CSS.escape(id)}"]`) !== null;
      const hostedIds = [...document.querySelectorAll("[data-scroll-anchor]")].map(
        (el) => el.getAttribute("data-scroll-anchor") ?? "",
      );
      const gaps = findAnchorGaps(ids, hosts, hostedIds);
      for (const message of describeAnchorGaps(gaps, consumer, window.location.pathname)) {
        console.warn(message);
      }
    }, 0);
    return () => window.clearTimeout(frame);
  }, [ids, consumer]);
}

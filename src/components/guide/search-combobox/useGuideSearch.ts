"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchGuide } from "@/lib/guide-search";
import type { SearchResult } from "@/lib/guide-search";

/**
 * Search state + keyboard/navigation logic for the guide combobox.
 *
 * The sync title/tag/description ladder (`searchGuide`) runs immediately; the
 * heavy full-text body index is loaded lazily on first search and its matches
 * are appended BELOW the ladder (see augmentWithBodies). Extracted from
 * SearchCombobox to keep that component presentational and under the TSX line
 * budget.
 */
export function useGuideSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  // Tracks the active debounce timer so Enter can flush it synchronously.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks which query the current `results` correspond to (vs. lagging during debounce).
  const resultsForQueryRef = useRef<string>("");
  const router = useRouter();

  // Lazily load the body-text index (heavy: pulls in all guide bodies) and
  // append its matches BELOW the sync results. The import is dynamic so the
  // content never lands in the initial bundle; after the first call the module
  // is cached, so later searches resolve instantly. `isCurrent` guards against
  // a stale query resolving after the user typed on.
  const augmentWithBodies = useCallback(
    (forQuery: string, base: SearchResult[], isCurrent: () => boolean) => {
      import("@/lib/guide-body-index")
        .then((m) => {
          if (!isCurrent()) return;
          const excludeIds = base.map((r) => r.topic.id);
          const bodyResults = m.searchGuideBodies(forQuery, excludeIds, 15 - base.length);
          const merged = base.concat(bodyResults).slice(0, 15);
          setResults(merged);
          setIsPending(false);
          setIsOpen(merged.length > 0 || forQuery.length >= 2);
          resultsForQueryRef.current = forQuery;
        })
        .catch(() => {
          if (!isCurrent()) return;
          // Body index failed to load — fall back to the sync results only.
          setResults(base);
          setIsPending(false);
          setIsOpen(base.length > 0 || forQuery.length >= 2);
          resultsForQueryRef.current = forQuery;
        });
    },
    [],
  );

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      queueMicrotask(() => { setResults([]); setIsOpen(false); setIsPending(false); });
      resultsForQueryRef.current = query;
      return;
    }
    let cancelled = false;
    // Acknowledge typing immediately: open the popover with a pending row while
    // the debounce + search runs, so a query never sits in dead air.
    queueMicrotask(() => { if (!cancelled) { setIsPending(true); setIsOpen(true); } });
    const timer = setTimeout(() => {
      const base = searchGuide(query);
      setActiveIndex(-1);
      // Show the sync ladder immediately; keep the "Searching…" row only while
      // there is nothing yet and the body index might still add matches.
      if (base.length > 0) {
        setResults(base);
        setIsPending(false);
        setIsOpen(true);
        resultsForQueryRef.current = query;
      }
      augmentWithBodies(query, base, () => !cancelled);
      if (debounceTimerRef.current === timer) debounceTimerRef.current = null;
    }, 150);
    debounceTimerRef.current = timer;
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (debounceTimerRef.current === timer) debounceTimerRef.current = null;
    };
  }, [query, augmentWithBodies]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    listRef.current.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const navigate = useCallback(
    (result: SearchResult) => {
      setIsOpen(false);
      setQuery("");
      router.push(`/guide/${result.category.id}/${result.topic.id}`);
    },
    [router],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        // Already-highlighted result wins
        if (activeIndex >= 0 && results[activeIndex]) {
          e.preventDefault();
          navigate(results[activeIndex]);
          return;
        }
        // Otherwise: flush any pending debounce so Enter never sits in dead air
        if (query.trim().length < 2) return;
        e.preventDefault();
        let liveResults = results;
        const isStale = resultsForQueryRef.current !== query;
        if (isStale || debounceTimerRef.current) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
          }
          // Flush the sync ladder synchronously so Enter never sits in dead air,
          // and kick the async body augmentation for body-only queries (its
          // matches merge in a beat later — a second Enter then navigates them).
          liveResults = searchGuide(query);
          setResults(liveResults);
          setActiveIndex(-1);
          resultsForQueryRef.current = query;
          setIsPending(liveResults.length === 0);
          augmentWithBodies(query, liveResults, () => resultsForQueryRef.current === query);
        }
        if (liveResults.length > 0) {
          navigate(liveResults[0]);
        } else {
          // 0 sync results: keep the dropdown open so the pending/body/no-match
          // row gives feedback while the body index resolves.
          setIsOpen(true);
        }
      } else if (e.key === "Escape" || e.key === "Tab") {
        setIsOpen(false);
      }
    },
    [activeIndex, results, navigate, query, augmentWithBodies],
  );

  return {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    isPending,
    activeIndex,
    listRef,
    navigate,
    onKeyDown,
  };
}

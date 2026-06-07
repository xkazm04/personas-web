"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { searchGuide, groupResultsByCategory } from "@/lib/guide-search";
import type { SearchResult } from "@/lib/guide-search";
import { SearchResultsPopover } from "./search-combobox/SearchResultsPopover";

interface SearchComboboxProps {
  placeholder?: string;
  className?: string;
}

export default function SearchCombobox({
  placeholder = "Search topics\u2026",
  className = "",
}: SearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Tracks the active debounce timer so Enter can flush it synchronously
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks which query the current `results` correspond to (vs. lagging during debounce)
  const resultsForQueryRef = useRef<string>("");
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      queueMicrotask(() => { setResults([]); setIsOpen(false); setIsPending(false); });
      resultsForQueryRef.current = query;
      return;
    }
    // Acknowledge typing immediately: open the popover with a pending row while
    // the debounce + search runs, so a query never sits in dead air.
    queueMicrotask(() => { setIsPending(true); setIsOpen(true); });
    const timer = setTimeout(() => {
      const r = searchGuide(query);
      setResults(r);
      setIsPending(false);
      setIsOpen(r.length > 0 || query.length >= 2);
      setActiveIndex(-1);
      resultsForQueryRef.current = query;
      if (debounceTimerRef.current === timer) debounceTimerRef.current = null;
    }, 150);
    debounceTimerRef.current = timer;
    return () => {
      clearTimeout(timer);
      if (debounceTimerRef.current === timer) debounceTimerRef.current = null;
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
          liveResults = searchGuide(query);
          setResults(liveResults);
          setIsPending(false);
          setActiveIndex(-1);
          resultsForQueryRef.current = query;
        }
        if (liveResults.length > 0) {
          navigate(liveResults[0]);
        } else {
          // 0 results: ensure dropdown is visible so the "No matches" row gives feedback
          setIsOpen(true);
        }
      } else if (e.key === "Escape" || e.key === "Tab") {
        setIsOpen(false);
      }
    },
    [activeIndex, results, navigate, query],
  );

  const grouped = useMemo(() => groupResultsByCategory(results), [results]);

  // Pre-compute flat index map so indices are stable across re-renders
  const flatIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    for (const group of grouped) {
      for (const r of group.results) {
        map.set(r.topic.id, idx++);
      }
    }
    return map;
  }, [grouped]);

  const activeId = activeIndex >= 0 ? `search-option-${activeIndex}` : undefined;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div aria-live="polite" className="sr-only">
        {isOpen && results.length > 0
          ? `${results.length} result${results.length !== 1 ? "s" : ""} for ${query}`
          : isOpen && results.length === 0 && query.length >= 2
            ? `No topics found for ${query}`
            : ""}
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark" />
        <input
          ref={inputRef}
          role="combobox"
          aria-label="Search guide topics"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="search-listbox"
          aria-activedescendant={activeId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-glass-hover bg-white/[0.04] py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-dark outline-none transition-colors focus-visible:border-glass-strong focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <SearchResultsPopover
            query={query}
            results={results}
            isPending={isPending}
            grouped={grouped}
            activeIndex={activeIndex}
            flatIndexMap={flatIndexMap}
            listRef={listRef}
            onNavigate={navigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

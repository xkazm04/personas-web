"use client";

import { useRef, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { groupResultsByCategory } from "@/lib/guide-search";
import { SearchResultsPopover } from "./search-combobox/SearchResultsPopover";
import { useGuideSearch } from "./search-combobox/useGuideSearch";

interface SearchComboboxProps {
  placeholder?: string;
  className?: string;
}

export default function SearchCombobox({
  placeholder = "Search topics…",
  className = "",
}: SearchComboboxProps) {
  const { query, setQuery, results, isOpen, setIsOpen, isPending, activeIndex, listRef, navigate, onKeyDown } =
    useGuideSearch();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setIsOpen]);

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

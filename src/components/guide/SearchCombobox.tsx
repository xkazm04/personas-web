"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { searchGuide, groupResultsByCategory } from "@/lib/guide-search";
import type { SearchResult } from "@/lib/guide-search";
import { TRANSITION_FAST } from "@/lib/animations";

interface SearchComboboxProps {
  placeholder?: string;
  className?: string;
}

const BADGE_LABEL: Record<SearchResult["matchType"], string | null> = {
  "exact-title": null,
  "exact-tag": "tag",
  "fuzzy-title": "~",
  "fuzzy-tag": "~tag",
  description: "desc",
};

export default function SearchCombobox({
  placeholder = "Search topics\u2026",
  className = "",
}: SearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { queueMicrotask(() => { setResults([]); setIsOpen(false); }); return; }
    const timer = setTimeout(() => {
      const r = searchGuide(query);
      setResults(r);
      setIsOpen(r.length > 0 || query.length >= 2);
      setActiveIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
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
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        navigate(results[activeIndex]);
      } else if (e.key === "Escape" || e.key === "Tab") {
        setIsOpen(false);
      }
    },
    [activeIndex, results, navigate],
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
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-dark outline-none transition-colors focus:border-white/[0.16] focus:bg-white/[0.06]"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="search-listbox"
            role="listbox"
            aria-label="Search results"
            ref={listRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={TRANSITION_FAST}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/[0.08] bg-surface/95 shadow-2xl backdrop-blur-xl"
          >
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-base text-muted-dark">
                No topics found for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <>
                {grouped.map((group) => (
                  <div key={group.category.id}>
                    <div className="sticky top-0 z-10 flex items-center gap-2 bg-surface/90 px-3 py-1.5 backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.category.color }} aria-hidden="true" />
                      <span className="text-sm font-medium text-muted-dark">{group.category.name}</span>
                    </div>
                    {group.results.map((result) => {
                      const idx = flatIndexMap.get(result.topic.id) ?? -1;
                      const isActive = idx === activeIndex;
                      const badge = BADGE_LABEL[result.matchType];
                      return (
                        <button
                          key={result.topic.id}
                          id={`search-option-${idx}`}
                          role="option"
                          aria-selected={isActive}
                          data-index={idx}
                          onClick={() => navigate(result)}
                          className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-base transition-colors ${
                            isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: group.category.color }} />
                          <span className="min-w-0 flex-1 truncate text-foreground">{result.topic.title}</span>
                          {badge && (
                            <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-base leading-none text-muted-dark">
                              {badge}
                            </span>
                          )}
                          {isActive && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-dark" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
                <div className="border-t border-white/[0.06] px-3 py-1.5 text-right text-base text-muted-dark" aria-live="polite">
                  {results.length} result{results.length !== 1 && "s"}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

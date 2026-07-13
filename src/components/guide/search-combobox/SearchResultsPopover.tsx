import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

import { highlightMatch } from "@/lib/highlight-match";
import { TRANSITION_FAST } from "@/lib/animations";
import type { SearchResult } from "@/lib/guide-search";

const BADGE_LABEL: Record<SearchResult["matchType"], string | null> = {
  "exact-title": null,
  "exact-tag": "tag",
  "fuzzy-title": "~",
  "fuzzy-tag": "~tag",
  description: "desc",
  // Body matches carry their own inline excerpt as the signal — no chrome badge
  // (which would need a translated label) is added.
  body: null,
};

export function SearchResultsPopover({
  query,
  results,
  isPending,
  grouped,
  activeIndex,
  flatIndexMap,
  listRef,
  onNavigate,
}: {
  query: string;
  results: SearchResult[];
  isPending: boolean;
  grouped: ReturnType<typeof import("@/lib/guide-search").groupResultsByCategory>;
  activeIndex: number;
  flatIndexMap: Map<string, number>;
  listRef: React.RefObject<HTMLDivElement | null>;
  onNavigate: (result: SearchResult) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      id="search-listbox"
      role="listbox"
      aria-label="Search results"
      ref={listRef}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={reduced ? { duration: 0 } : TRANSITION_FAST}
      className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-glass-hover bg-surface/95 shadow-2xl backdrop-blur-xl"
    >
      {isPending && results.length === 0 ? (
        <p className="flex items-center justify-center gap-2 px-4 py-6 text-center text-base text-muted-dark">
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          Searching&hellip;
        </p>
      ) : results.length === 0 ? (
        <p className="px-4 py-6 text-center text-base text-muted-dark">
          No topics found for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <>
          {grouped.map((group) => (
            <div key={group.category.id}>
              <div className="sticky top-0 z-10 flex items-center gap-2 bg-surface/90 px-3 py-1.5 backdrop-blur-md">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: group.category.color }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-muted-dark">
                  {group.category.name}
                </span>
              </div>
              {group.results.map((result) => {
                const index = flatIndexMap.get(result.topic.id) ?? -1;
                const isActive = index === activeIndex;
                const badge = BADGE_LABEL[result.matchType];

                return (
                  <button
                    key={result.topic.id}
                    id={`search-option-${index}`}
                    role="option"
                    aria-selected={isActive}
                    data-index={index}
                    onClick={() => onNavigate(result)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-base transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 self-start mt-1.5 rounded-full"
                      style={{ backgroundColor: group.category.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-foreground">
                        {highlightMatch(result.topic.title, query, result.matchType, group.category.color)}
                      </span>
                      {result.excerpt && (
                        <span className="mt-0.5 block truncate text-sm text-muted-dark">
                          {highlightMatch(result.excerpt, query, result.matchType, group.category.color)}
                        </span>
                      )}
                    </span>
                    {badge && (
                      <span className="shrink-0 self-start mt-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-xs leading-none text-muted-dark">
                        {badge}
                      </span>
                    )}
                    {isActive && <ArrowRight className="h-3.5 w-3.5 shrink-0 self-start mt-1 text-muted-dark" />}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="border-t border-glass px-3 py-1.5 text-right text-xs text-muted-dark">
            {results.length} result{results.length !== 1 && "s"}
          </div>
        </>
      )}
    </motion.div>
  );
}

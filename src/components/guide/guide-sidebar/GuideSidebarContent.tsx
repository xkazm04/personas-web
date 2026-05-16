import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import type { Variants } from "framer-motion";

import type { GUIDE_CATEGORIES } from "@/data/guide/categories";
import type { GuideTopic } from "@/data/guide/types";

const FOCUS_RING = "outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

type SidebarCategory = (typeof GUIDE_CATEGORIES)[number] & {
  topics: GuideTopic[];
};

export function GuideSidebarContent({
  announcement,
  query,
  totalFilteredTopics,
  filteredCategories,
  expanded,
  activeCategory,
  activeTopic,
  collapseVariants,
  onQueryChange,
  onToggleCategory,
  onNavigateTopic,
}: {
  announcement: string;
  query: string;
  totalFilteredTopics: number;
  filteredCategories: SidebarCategory[];
  expanded: Record<string, boolean>;
  activeCategory: string;
  activeTopic: string;
  collapseVariants: Variants;
  onQueryChange: (query: string) => void;
  onToggleCategory: (id: string) => void;
  onNavigateTopic: () => void;
}) {
  return (
    <nav className="flex h-full flex-col">
      <div aria-live="polite" className="sr-only">{announcement}</div>

      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-dark" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search topics..."
            aria-label="Search sidebar topics"
            className={`w-full rounded-lg border border-glass-hover bg-white/[0.03] py-2 pl-9 pr-3 text-base text-foreground placeholder:text-muted-dark transition-colors focus-visible:border-brand-cyan/30 ${FOCUS_RING}`}
          />
        </div>
        {query.trim() && (
          <div aria-live="polite" className="sr-only">
            {totalFilteredTopics} result{totalFilteredTopics !== 1 ? "s" : ""} for {query}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredCategories.map((category) => {
          const isExpanded = expanded[category.id] || !!query.trim();
          const isActiveCategory = activeCategory === category.id;

          return (
            <div key={category.id} className="mb-0.5">
              <button
                onClick={() => onToggleCategory(category.id)}
                aria-expanded={isExpanded}
                aria-controls={`topics-${category.id}`}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-base font-semibold transition-colors hover:bg-white/[0.04] ${FOCUS_RING} ${
                  isActiveCategory && !activeTopic ? "bg-white/[0.06] text-foreground" : "text-muted"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{category.name}</span>
                <span className="text-base text-muted-dark tabular-nums">
                  {category.topics.length}
                </span>
                <ChevronRight
                  className={`h-3 w-3 text-muted-dark transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && category.topics.length > 0 && (
                  <motion.div
                    key={`${category.id}-topics`}
                    id={`topics-${category.id}`}
                    role="region"
                    variants={collapseVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <div className="ml-4 border-l border-glass pl-2 py-0.5">
                      {category.topics.map((topic) => {
                        const isActive = activeTopic === topic.id;
                        return (
                          <Link
                            key={topic.id}
                            href={`/guide/${category.id}/${topic.id}`}
                            onClick={onNavigateTopic}
                            className={`block rounded-md px-2.5 py-1.5 text-base transition-colors ${FOCUS_RING} ${
                              isActive
                                ? "bg-white/[0.06] text-foreground border-l-2 -ml-[calc(0.5rem+1px)] pl-[calc(0.625rem+1px)]"
                                : "text-muted-dark hover:text-muted hover:bg-white/[0.03]"
                            }`}
                            style={isActive ? { borderLeftColor: category.color } : undefined}
                          >
                            {topic.title}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredCategories.length === 0 && query.trim() && (
          <p className="px-3 py-6 text-center text-base text-muted-dark">
            No topics match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </nav>
  );
}

export { FOCUS_RING };

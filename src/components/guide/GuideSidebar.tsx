"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Menu, X } from "lucide-react";
import type { Variants } from "framer-motion";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import type { GuideTopic } from "@/data/guide/types";

/* ── Helpers ─────────────────────────────────────────────────────────── */

function topicsFor(categoryId: string) {
  return GUIDE_TOPICS.filter((t) => t.categoryId === categoryId);
}

const collapseVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function GuideSidebar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ["guide"] or ["guide","credentials"] or ["guide","credentials","topic-id"]
  const activeCategory = segments[1] ?? "";
  const activeTopic = segments[2] ?? "";

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Auto-expand the active category
    const init: Record<string, boolean> = {};
    if (activeCategory) init[activeCategory] = true;
    return init;
  });
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ── Filtered categories/topics based on search ─────────────────── */
  const filteredCategories = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return GUIDE_CATEGORIES.map((cat) => ({ ...cat, topics: topicsFor(cat.id) }));
    return GUIDE_CATEGORIES.map((cat) => {
      const topics = topicsFor(cat.id).filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
      return { ...cat, topics };
    }).filter((cat) => cat.topics.length > 0 || cat.name.toLowerCase().includes(q));
  }, [query]);

  /* ── Sidebar content (shared between desktop & mobile) ──────────── */
  const sidebarContent = (
    <nav className="flex h-full flex-col">
      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-dark" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics..."
            aria-label="Search sidebar topics"
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-dark outline-none transition-colors focus:border-brand-cyan/30"
          />
        </div>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredCategories.map((cat) => {
          const isExpanded = expanded[cat.id] || !!query.trim();
          const isActiveCategory = activeCategory === cat.id;
          const topics: GuideTopic[] = cat.topics;

          return (
            <div key={cat.id} className="mb-0.5">
              {/* Category header */}
              <button
                onClick={() => toggle(cat.id)}
                aria-expanded={isExpanded}
                aria-controls={`topics-${cat.id}`}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-white/[0.04] ${
                  isActiveCategory && !activeTopic ? "bg-white/[0.06] text-foreground" : "text-muted"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{cat.name}</span>
                <span className="text-sm text-muted-dark tabular-nums">{topics.length}</span>
                <ChevronRight
                  className={`h-3 w-3 text-muted-dark transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Topic links */}
              <AnimatePresence initial={false}>
                {isExpanded && topics.length > 0 && (
                  <motion.div
                    key={cat.id + "-topics"}
                    id={`topics-${cat.id}`}
                    role="region"
                    variants={collapseVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <div className="ml-4 border-l border-white/[0.06] pl-2 py-0.5">
                      {topics.map((topic) => {
                        const isActive = activeTopic === topic.id;
                        return (
                          <Link
                            key={topic.id}
                            href={`/guide/${cat.id}/${topic.id}`}
                            onClick={() => setMobileOpen(false)}
                            className={`block rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                              isActive
                                ? "bg-white/[0.06] text-foreground border-l-2 -ml-[calc(0.5rem+1px)] pl-[calc(0.625rem+1px)]"
                                : "text-muted-dark hover:text-muted hover:bg-white/[0.03]"
                            }`}
                            style={isActive ? { borderLeftColor: cat.color } : undefined}
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
          <p className="px-3 py-6 text-center text-sm text-muted-dark">
            No topics match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* ── Mobile toggle button ──────────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-20 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-surface/80 backdrop-blur-sm text-muted-dark transition-colors hover:text-foreground lg:hidden"
        aria-label="Open guide navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* ── Mobile overlay ────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 z-50 h-dvh w-72 border-r border-white/[0.06] bg-surface pt-16 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-[1.125rem] flex h-8 w-8 items-center justify-center rounded-lg text-muted-dark transition-colors hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-white/[0.06] bg-white/[0.02] sticky top-16 h-[calc(100dvh-4rem)]">
        {sidebarContent}
      </aside>
    </>
  );
}

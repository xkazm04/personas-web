"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { Variants } from "framer-motion";

import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useTranslation } from "@/i18n/useTranslation";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/bodyScrollLock";
import { isTopicVisible } from "@/lib/guide-utils";

import { CHROME_SIDEBAR_STICKY, CHROME_TOP_MOBILE_BAR } from "./guide-chrome";
import { FOCUS_RING, GuideSidebarContent } from "./guide-sidebar/GuideSidebarContent";

function topicsFor(categoryId: string) {
  return GUIDE_TOPICS.filter((topic) => topic.categoryId === categoryId && isTopicVisible(topic));
}

export default function GuideSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const activeCategory = segments[1] ?? "";
  const activeTopic = segments[2] ?? "";
  const shouldReduceMotion = useReducedMotion();

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (activeCategory) init[activeCategory] = true;
    return init;
  });
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // The drawer claims role="dialog" aria-modal="true", so it has to behave like
  // one: focus moves in on open and is restored to the trigger on close, Tab
  // cycles inside the panel, Escape dismisses, and the page behind it cannot
  // scroll. Same primitives every other modal in the repo uses.
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useFocusTrap({
    active: mobileOpen,
    containerRef: drawerRef,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!mobileOpen) return;
    lockBodyScroll();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockBodyScroll();
    };
  }, [mobileOpen, closeMobile]);

  const collapseVariants: Variants = shouldReduceMotion
    ? {
        hidden: { height: 0, overflow: "hidden" },
        visible: { height: "auto", overflow: "hidden" },
        exit: { height: 0, overflow: "hidden" },
      }
    : {
        hidden: { height: 0, opacity: 0 },
        visible: { height: "auto", opacity: 1, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
        exit: { height: 0, opacity: 0, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } },
      };

  const mobileTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const willExpand = !prev[id];
      const topics = topicsFor(id);
      const category = GUIDE_CATEGORIES.find((item) => item.id === id);
      setAnnouncement(
        willExpand
          ? `${category?.name}: ${topics.length} topic${topics.length !== 1 ? "s" : ""} shown`
          : `${category?.name}: collapsed`,
      );
      return { ...prev, [id]: willExpand };
    });

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return GUIDE_CATEGORIES.map((category) => ({
        ...category,
        topics: topicsFor(category.id),
      }));
    }
    return GUIDE_CATEGORIES.map((category) => {
      const topics = topicsFor(category.id).filter(
        (topic) =>
          topic.title.toLowerCase().includes(normalizedQuery) ||
          topic.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
      );
      return { ...category, topics };
    }).filter(
      (category) =>
        category.topics.length > 0 ||
        category.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const totalFilteredTopics = filteredCategories.reduce(
    (sum, category) => sum + category.topics.length,
    0,
  );

  const sidebarContent = (
    <GuideSidebarContent
      announcement={announcement}
      query={query}
      totalFilteredTopics={totalFilteredTopics}
      filteredCategories={filteredCategories}
      expanded={expanded}
      activeCategory={activeCategory}
      activeTopic={activeTopic}
      collapseVariants={collapseVariants}
      onQueryChange={setQuery}
      onToggleCategory={toggle}
      onNavigateTopic={closeMobile}
    />
  );

  return (
    <>
      {/* Shares the mobile chrome band with MobileTopicTOC, which reserves the
          matching CHROME_TRIGGER_LANE on its left so the two never overlap. */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`fixed left-3 ${CHROME_TOP_MOBILE_BAR} z-40 flex h-11 w-11 items-center justify-center rounded-lg border border-glass-hover bg-surface/90 backdrop-blur-sm text-muted-dark transition-colors hover:text-foreground lg:hidden ${FOCUS_RING}`}
        aria-label="Open guide navigation"
        aria-expanded={mobileOpen}
      >
        <Menu className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.guide}
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={mobileTransition}
              className="fixed left-0 top-0 z-50 h-dvh w-[min(20rem,calc(100vw-1rem))] border-r border-glass bg-surface pb-safe pt-16 lg:hidden"
            >
              <button
                ref={closeButtonRef}
                onClick={closeMobile}
                className={`absolute right-3 top-[1.125rem] flex h-8 w-8 items-center justify-center rounded-lg text-muted-dark transition-colors hover:text-foreground ${FOCUS_RING}`}
                aria-label={t.pageNav.closeMenu}
              >
                <X className="h-4 w-4" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        className={`hidden lg:block w-72 shrink-0 border-r border-glass bg-white/[0.02] sticky ${CHROME_SIDEBAR_STICKY}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

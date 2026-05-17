"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/bodyScrollLock";

import { useActiveHeading } from "./useActiveHeading";
import type { GuideHeading } from "./guide-markdown/extractHeadings";

interface MobileTopicTOCProps {
  headings: GuideHeading[];
}

export default function MobileTopicTOC({ headings }: MobileTopicTOCProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const tocHeadings = useMemo(
    () => headings.filter((h) => h.depth === 2 || h.depth === 3),
    [headings],
  );
  const activeId = useActiveHeading(tocHeadings);
  const activeLabel = useMemo(
    () => tocHeadings.find((h) => h.id === activeId)?.text ?? tocHeadings[0]?.text ?? "",
    [tocHeadings, activeId],
  );

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockBodyScroll();
    };
  }, [open, close]);

  const scrollTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      close();
    },
    [close],
  );

  if (tocHeadings.length === 0) return null;

  return (
    <div className="fixed top-[60px] left-0 right-0 z-40 lg:hidden">
      <div className="border-b border-glass bg-background/80 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex h-9 w-full items-center justify-between gap-3 px-4 text-sm font-mono uppercase tracking-wider text-muted-dark focus-ring"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-muted">{t.pageNav.onThisPage}</span>
            <span className="text-muted-dark">·</span>
            <span className="truncate text-foreground">{activeLabel}</span>
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-dark"
            aria-hidden
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={close}
              aria-label={t.pageNav.closeMenu}
              className="fixed inset-0 top-[96px] -z-10 bg-background/60 backdrop-blur-sm"
            />
            <motion.nav
              key="panel"
              id={panelId}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="max-h-[70vh] overflow-y-auto border-b border-glass bg-surface/95 backdrop-blur-xl"
              aria-label={t.pageNav.onThisPage}
            >
              <ul className="mx-auto flex max-w-2xl flex-col py-1">
                {tocHeadings.map((heading) => {
                  const isActive = heading.id === activeId;
                  return (
                    <li key={heading.id}>
                      <button
                        type="button"
                        onClick={() => scrollTo(heading.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-base transition-colors focus-ring ${
                          heading.depth === 3 ? "pl-8 text-muted-dark/90" : ""
                        } ${
                          isActive ? "text-brand-cyan" : "text-muted-dark hover:text-foreground"
                        }`}
                      >
                        <span className="truncate">{heading.text}</span>
                        <span
                          className={`h-px transition-[width] duration-200 ${
                            isActive ? "w-6 bg-brand-cyan/70" : "w-3 bg-muted-dark/40"
                          }`}
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

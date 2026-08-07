"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useTranslation } from "@/i18n/useTranslation";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/bodyScrollLock";

import { CHROME_TOP_MOBILE_BELOW } from "./guide-chrome";
import { FOCUS_RING } from "./guide-sidebar/GuideSidebarContent";

/**
 * Loaded on demand: `SearchCombobox` pulls in `guide-search`, which needs the
 * whole `GUIDE_TOPICS` table (titles, tags AND descriptions) to run its
 * matching ladder. Static-importing it here would put those 57 KB back into
 * the initial bundle of every reading route — the exact payload the sidebar
 * projection removes. The dialog is user-initiated, so the chunk is fetched
 * on the first open and cached from then on.
 */
const SearchCombobox = dynamic(() => import("./SearchCombobox"), {
  ssr: false,
  // Same height as the real input, so the panel does not jump on load.
  loading: () => <div className="h-[46px] rounded-xl border border-glass-hover bg-white/[0.03]" />,
});

/**
 * Full-guide search, reachable from every guide route.
 *
 * The fuzzy `SearchCombobox` (title/tag/description ladder + the lazy
 * full-text body tier) used to be mounted on the guide hub only, so a reader
 * inside a category or a topic could reach it just by navigating back to
 * `/guide`. This launcher lifts the *same* combobox into a modal so it is one
 * button — or one Cmd/Ctrl+K — away everywhere. There is deliberately no
 * second search implementation: the hook, the ladder, and the popover are
 * reused verbatim.
 *
 * Placement note: the trigger is rendered **in flow**, inside the page's own
 * header row, not as another fixed bar. The fixed reading-chrome band
 * (`guide-chrome.ts`) is already fully allocated — navbar → progress bar →
 * mobile TOC bar + sidebar-trigger lane — and a fourth pinned element would
 * have to claim a lane from the TOC bar on every topic page. The in-flow
 * trigger sits below that band by construction, at the same offsets on mobile
 * and desktop.
 */

/** `true` on Apple platforms, where the shortcut glyph is ⌘ instead of Ctrl. */
function useIsApplePlatform(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent),
    () => false,
  );
}

interface GuideSearchLauncherProps {
  /**
   * Register the Cmd/Ctrl+K binding without painting a trigger button — used
   * on routes that already show search prominently (the hub) or have no
   * header row to host it (the 404 bodies).
   */
  hotkeyOnly?: boolean;
  className?: string;
}

export default function GuideSearchLauncher({
  hotkeyOnly = false,
  className = "",
}: GuideSearchLauncherProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const isApple = useIsApplePlatform();
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on navigation (a result was picked, by click or by Enter inside the
  // hook). Done in render via the prev-state pattern, not in an effect —
  // React 19 forbids synchronous setState in an effect body.
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  // Cmd/Ctrl+K toggles the dialog from anywhere on the guide.
  //
  // The repo's other binding (`useReviewKeyboardShortcuts`) bails out on any
  // modifier and on any focused text field, because those are BARE-letter
  // shortcuts that would otherwise hijack Ctrl+R and type-ahead. Neither
  // reason applies here: Cmd/Ctrl+K is itself a chord, so there is nothing to
  // hijack, and the platform convention (VS Code, Linear, docs sites) is that
  // it opens search even while a text field has focus — which is exactly the
  // case that matters, since the sidebar's own filter input is focusable on
  // every guide route. So the field guard is intentionally NOT applied; only
  // the plain-`k` case is excluded, by requiring the modifier.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "k" && event.key !== "K") return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      event.preventDefault();
      setOpen((wasOpen) => !wasOpen);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Real dialog behaviour: focus moves into the panel and is restored to the
  // trigger on close, Tab cycles inside, Escape dismisses, page cannot scroll.
  // Same primitives as the sidebar drawer.
  useFocusTrap({ active: open, containerRef: panelRef });

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

  return (
    <>
      {!hotkeyOnly && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-base text-muted-dark transition-colors hover:border-glass-strong hover:text-foreground ${FOCUS_RING} ${className}`}
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t.guide.searchAllTopics}</span>
          <kbd
            aria-hidden="true"
            className="hidden rounded border border-glass px-1.5 py-0.5 font-mono text-xs leading-none text-muted-dark sm:inline"
          >
            {isApple ? "⌘" : "Ctrl"}K
          </kbd>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.15 }}
              onClick={close}
              className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm"
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={t.guide.searchAllTopics}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={reduced ? { duration: 0 } : { duration: 0.18 }}
              className={`fixed inset-x-0 ${CHROME_TOP_MOBILE_BELOW} z-[70] mx-auto w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-glass-hover bg-surface/95 p-4 shadow-2xl backdrop-blur-xl`}
            >
              <SearchCombobox placeholder={t.guide.searchPlaceholder} autoFocus />
              <button
                type="button"
                onClick={close}
                aria-label={t.pageNav.closeMenu}
                className={`absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border border-glass-hover bg-surface text-muted-dark transition-colors hover:text-foreground ${FOCUS_RING}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

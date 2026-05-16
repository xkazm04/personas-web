"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import AgentDetail from "@/components/dashboard/AgentDetail";
import type { Persona } from "@/lib/types";
import { useTranslation } from "@/i18n/useTranslation";

interface AgentDetailDrawerProps {
  persona: Persona | null;
  onClose: () => void;
}

export default function AgentDetailDrawer({ persona, onClose }: AgentDetailDrawerProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Pin onClose to a ref so an inline-arrow callback at the call site doesn't
  // re-run the effect (which would tear down the focus trap and Esc handler
  // on every parent render).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Esc key + Tab focus trap
  useEffect(() => {
    if (!persona) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handler);

    // Focus the close button on open so Tab cycles within the panel
    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>("[data-drawer-close]");
      target?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handler);
      window.clearTimeout(focusTimer);
      // Guard against restoring focus to a node that was unmounted while the
      // drawer was open (e.g. a refetch dropped the persona card, or the user
      // navigated). Without this, focus() lands on a detached node and
      // keyboard/SR users lose focus to <body> with no announcement.
      const prev = previousFocusRef.current;
      previousFocusRef.current = null;
      if (prev instanceof HTMLElement && document.contains(prev)) {
        prev.focus();
        return;
      }
      // Fallback: focus the page heading so a SR announces "<page name>"
      // and keyboard users land somewhere sensible. Headings aren't
      // focusable by default — set tabIndex temporarily so focus() works.
      const fallback = document.querySelector<HTMLElement>("main h1, h1");
      if (fallback) {
        const hadTabIndex = fallback.hasAttribute("tabindex");
        if (!hadTabIndex) fallback.tabIndex = -1;
        fallback.focus({ preventScroll: true });
        if (!hadTabIndex) {
          // Remove the synthetic tabindex once focus has moved off it.
          fallback.addEventListener(
            "blur",
            () => fallback.removeAttribute("tabindex"),
            { once: true },
          );
        }
      }
    };
  }, [persona]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {persona && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-detail-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/[0.06] bg-background/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] bg-background/80 px-5 py-4 backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-3">
                <PersonaAvatar
                  icon={persona.icon}
                  color={persona.color}
                  name={persona.name}
                  size="md"
                />
                <div className="min-w-0">
                  <h3
                    id="agent-detail-drawer-title"
                    className="truncate text-sm font-semibold text-foreground"
                  >
                    {persona.name}
                  </h3>
                  {persona.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-dark">
                      {persona.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                data-drawer-close
                onClick={onClose}
                aria-label={t.dashboardUi.closeAgentDetails}
                className="shrink-0 rounded-lg p-1.5 text-muted-dark transition-colors hover:bg-white/[0.06] hover:text-foreground focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {/* Stats row */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-dark">
                <span className="font-mono">{persona.maxConcurrent} {t.dashboardUi.max}</span>
                <span className="font-mono">
                  {(persona.timeoutMs / 1000).toFixed(0)}{t.dashboardUi.timeoutSuffix}
                </span>
                {persona.maxBudgetUsd && (
                  <span className="font-mono">
                    ${persona.maxBudgetUsd.toFixed(2)} {t.dashboardUi.budget}
                  </span>
                )}
              </div>

              <AgentDetail persona={persona} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

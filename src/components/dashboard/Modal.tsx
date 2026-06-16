"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Generic dashboard modal: backdrop + centered panel with header/body/footer
 * slots, escape-to-close, and click-outside-to-close. Used by the execution
 * and message detail modals; matches the desktop sub_activity/sub_messages
 * layout in web idiom (glow-card styling, semantic tokens).
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = "max-w-3xl",
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: string;
  ariaLabel?: string;
}) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  // role=dialog/aria-modal alone don't contain focus — without a trap, keyboard
  // and screen-reader users can Tab into the page behind the modal. This moves
  // focus into the panel on open, cycles Tab within it, and restores on close.
  useFocusTrap({ active: open, containerRef: panelRef });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto px-4 pb-6 pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-[rgba(8,11,20,0.7)] backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative flex w-full ${maxWidth} flex-col rounded-2xl border border-glass-hover bg-surface/95 shadow-2xl backdrop-blur-md`}
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between gap-4 border-b border-glass px-6 py-4">
                <div className="min-w-0 flex-1">
                  {title && (
                    <div className="text-lg font-semibold text-foreground">{title}</div>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-muted-dark">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-shrink-0 rounded-lg border border-glass p-1.5 text-muted-dark transition-colors hover:border-glass-hover hover:text-foreground focus-ring focus-visible:ring-offset-0"
                  aria-label={t.common.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {actions && (
              <div className="flex items-center justify-end gap-2 border-t border-glass px-6 py-3">
                {actions}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";

/**
 * Bottom sheet for mobile detail views — the native pattern that replaces a
 * centered modal on phones. Slides up from the bottom, dim+blur backdrop,
 * drag-down or swipe to dismiss, plus a visible close button + Escape +
 * backdrop tap (never swipe-only, per accessibility guidance). Locks body
 * scroll while open and respects the bottom safe-area inset.
 *
 * Kept from the retired /m tree (was `components/mobile/MobileSheet`) for the
 * new /m - see docs/concepts/mobile-revival/PLAN.md. First used by the phone
 * Personas view (persona detail + actions). Under reduced motion it appears
 * and leaves without sliding or fading (the DOM is the same either way).
 *
 * `keyboardSafe` (a sheet with a text field at its bottom, like a chat
 * composer): while the on-screen keyboard is open the sheet sits on top of it
 * instead of under it, and caps its height to the space left.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  keyboardSafe = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  keyboardSafe?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const still = useStillMotion();
  const instant = { duration: 0 };
  const keyboard = useKeyboardInset();
  const lift = keyboardSafe && keyboard > 0 ? keyboard : 0;
  useFocusTrap({ active: open, containerRef: panelRef });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-end"
          style={lift > 0 ? { bottom: lift } : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={still ? instant : undefined}
        >
          <div
            className="absolute inset-0 bg-[rgba(8,11,20,0.6)] backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={still ? instant : { type: "spring", stiffness: 360, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.25}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            style={lift > 0 ? { maxHeight: "calc(100% - 0.5rem)" } : undefined}
            className="relative flex max-h-[88svh] flex-col rounded-t-3xl border-t border-white/[0.08] bg-surface/95 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
          >
            <div className="flex shrink-0 cursor-grab justify-center pt-2.5 active:cursor-grabbing">
              <span className="h-1 w-9 rounded-full bg-white/20" aria-hidden="true" />
            </div>
            {(title || subtitle) && (
              <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-2">
                <div className="min-w-0 flex-1">
                  {title && (
                    <div id={titleId} className="truncate text-base font-semibold text-foreground">
                      {title}
                    </div>
                  )}
                  {subtitle && (
                    <p className="mt-0.5 text-[13px] text-muted-dark">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t.common.close}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-glass bg-white/[0.04] text-muted-dark transition-colors hover:text-foreground active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto overscroll-contain px-5 pb-2">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

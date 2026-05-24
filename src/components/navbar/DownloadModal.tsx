"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/bodyScrollLock";

interface DownloadOption {
  id: string;
  title: string;
  subtitle: string;
}

const OPTIONS: readonly DownloadOption[] = [
  { id: "win-x64", title: "Windows 11 x64", subtitle: "64-bit installer for Windows 11" },
  { id: "amd-x64", title: "AMD x64", subtitle: "64-bit installer for AMD-based systems" },
];

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Placeholder download modal — the listed options are dummy choices that
 * close the modal on click. Wire them to real installers when builds ship.
 */
export default function DownloadModal({ open, onClose }: DownloadModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    lockBodyScroll();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

    document.addEventListener("keydown", handleKey);

    queueMicrotask(() => {
      const first = modalRef.current?.querySelector<HTMLElement>("button");
      first?.focus();
    });

    return () => {
      unlockBodyScroll();
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSITION_FAST}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={TRANSITION_NORMAL}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] rounded-2xl border border-glass bg-background p-6 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
          >
            <button
              onClick={onClose}
              aria-label="Close download dialog"
              className="absolute right-4 top-4 rounded-lg p-2 text-muted-dark transition-colors hover:text-muted focus-ring outline-none"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cyan/15 ring-1 ring-brand-cyan/20">
                <Download className="h-5 w-5 text-brand-cyan" />
              </div>
              <div>
                <h3 id="download-modal-title" className="text-base font-semibold text-foreground">
                  Choose your download
                </h3>
                <p className="text-sm text-muted-dark">Pick the build that matches your system</p>
              </div>
            </div>

            <div className="mt-5 h-px bg-white/[0.04]" />

            <ul className="mt-5 space-y-2.5">
              {OPTIONS.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="group flex w-full items-center gap-3 rounded-xl border border-glass bg-white/[0.02] px-4 py-3 text-left transition-all hover:border-brand-cyan/30 hover:bg-brand-cyan/[0.04] focus-ring outline-none"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted transition-colors group-hover:bg-brand-cyan/10 group-hover:text-brand-cyan">
                      <Download className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-medium text-foreground">{opt.title}</div>
                      <div className="text-sm text-muted-dark">{opt.subtitle}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

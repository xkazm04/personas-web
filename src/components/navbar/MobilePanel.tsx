"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/i18n/useTranslation";
import { useRoutes } from "./useRoutes";

interface MobilePanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-in mobile navigation panel with backdrop.
 * Focus trap + scroll lock handled by useMobileMenu hook in parent.
 */
const MobilePanel = forwardRef<HTMLDivElement, MobilePanelProps>(
  function MobilePanel({ open, onClose }, ref) {
    const { t } = useTranslation();
    const routes = useRoutes();
    const pathname = usePathname();

    return (
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              ref={ref}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed top-0 right-0 z-50 flex h-full w-72 flex-col border-l border-glass bg-background shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-glass">
                <span className="text-base font-semibold tracking-tight text-foreground/80">
                  {t.nav.menu}
                </span>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center min-w-11 min-h-11 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors focus-ring"
                  aria-label="Close menu"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Route links */}
              <div className="flex flex-col gap-1 px-4 mt-4">
                {routes.map((route) => {
                  const isActive = pathname === route.href;
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={onClose}
                      className={`relative rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 focus-ring ${
                        isActive
                          ? "bg-brand-cyan/8 text-foreground border border-brand-cyan/15"
                          : "text-muted hover:text-foreground hover:bg-white/4 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan/70" />
                        )}
                        <span>{route.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="px-4 mt-4">
                <LanguageSwitcher />
              </div>

              <div className="flex-1" />

              <div className="px-4 pb-6">
                <Link
                  href="/#download"
                  onClick={onClose}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-6 py-2.5 text-base font-medium text-brand-cyan transition-all duration-300 hover:border-brand-cyan/40 hover:bg-brand-cyan/12 w-full focus-ring"
                >
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Download className="relative h-3.5 w-3.5" />
                  <span className="relative">{t.nav.download}</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  },
);

export default MobilePanel;

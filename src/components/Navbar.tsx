"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, Monitor, X } from "lucide-react";
import DesktopNav from "./navbar/DesktopNav";
import MobilePanel from "./navbar/MobilePanel";
import WaitlistModal from "./WaitlistModal";
import { useTranslation } from "@/i18n/useTranslation";
import { useMobileMenu } from "./navbar/useMobileMenu";

/**
 * Sticky header with a blurred glass surface on scroll. Delegates rendering
 * to DesktopNav + MobilePanel; shared mobile state lives in useMobileMenu.
 */
export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const { scrollY } = useScroll();
  const panelRef = useRef<HTMLDivElement>(null);
  const { open: mobileOpen, setOpen: setMobileOpen, close: closeMobile } =
    useMobileMenu(panelRef);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  const openDownload = useCallback(() => {
    closeMobile();
    setDownloadOpen(true);
  }, [closeMobile]);
  const closeDownload = useCallback(() => setDownloadOpen(false), []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-background/70 backdrop-blur-2xl shadow-[0_1px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <DesktopNav onDownloadClick={openDownload} />

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center min-w-11 min-h-11 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors lg:hidden focus-ring"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      <MobilePanel
        ref={panelRef}
        open={mobileOpen}
        onClose={closeMobile}
        onDownloadClick={openDownload}
      />

      {/* Desktop builds aren't shipping yet, so the CTA opens the canonical
          waitlist flow (same intent as /api/download's fallback) instead of a
          placeholder modal whose options downloaded nothing. */}
      <WaitlistModal
        platformKey="windows"
        platformLabel={t.downloadSection.windows}
        platformIcon={Monitor}
        open={downloadOpen}
        onClose={closeDownload}
      />
    </motion.header>
  );
}

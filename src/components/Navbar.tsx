"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import DesktopNav from "./navbar/DesktopNav";
import MobilePanel from "./navbar/MobilePanel";
import { useMobileMenu } from "./navbar/useMobileMenu";

/**
 * Sticky header with a blurred glass surface on scroll. Delegates rendering
 * to DesktopNav + MobilePanel; shared mobile state lives in useMobileMenu.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const panelRef = useRef<HTMLDivElement>(null);
  const { open: mobileOpen, setOpen: setMobileOpen, close: closeMobile } =
    useMobileMenu(panelRef);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

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
          <DesktopNav />

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center min-w-11 min-h-11 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors md:hidden focus-ring"
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

      <MobilePanel ref={panelRef} open={mobileOpen} onClose={closeMobile} />
    </motion.header>
  );
}

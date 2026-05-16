"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { COOKIE_CONSENT_KEY } from "@/lib/constants";
import { flushAnalyticsQueue } from "@/lib/analytics";

// localStorage throws SecurityError in Safari Private mode, embedded
// webviews with storage disabled, and some tracking-protection partition
// modes. CookieConsent is mounted in the root layout, so an unguarded
// throw here white-screens every route. Treat unreadable storage as
// already-consented (skip showing the banner) and silently swallow write
// failures — there's nothing actionable for the user.
function readConsent(): string | null {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return "essential";
  }
}

function writeConsent(value: "all" | "essential"): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // Storage unavailable / full — preference is in-memory only.
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) queueMicrotask(() => setVisible(true));
  }, []);

  const accept = (value: "all" | "essential") => {
    writeConsent(value);
    setVisible(false);
    if (value === "all") flushAnalyticsQueue();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 inset-x-0 z-50 flex justify-center p-4"
        >
          <div className="relative w-full max-w-4xl rounded-2xl bg-card-bg/95 backdrop-blur-xl border border-glass-hover px-6 py-4 shadow-2xl">
            <button
              onClick={() => accept("essential")}
              className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-dark hover:text-muted hover:bg-white/[0.06] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Cookie size={20} className="shrink-0 text-brand-cyan" />
                <p className="text-sm leading-relaxed text-muted">
                  We use essential cookies to keep things running smoothly. No
                  tracking, no ads.{" "}
                  <Link href="/legal#cookies" className="underline text-brand-cyan/80 hover:text-brand-cyan">
                    Details
                  </Link>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => accept("essential")}
                  className="px-4 py-1.5 text-sm rounded-lg text-muted-dark hover:text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => accept("all")}
                  className="px-4 py-1.5 text-sm rounded-lg bg-brand-cyan text-black font-medium hover:bg-brand-cyan/90 transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

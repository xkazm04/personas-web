"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const KEY = "personas-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) queueMicrotask(() => setVisible(true));
  }, []);

  const accept = (value: "all" | "essential") => {
    localStorage.setItem(KEY, value);
    setVisible(false);
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
          <div className="relative w-full max-w-4xl rounded-2xl bg-surface/95 backdrop-blur-xl border border-white/[0.08] px-6 py-4 shadow-2xl">
            <button
              onClick={() => accept("essential")}
              className="absolute top-3 right-3 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Cookie size={20} className="shrink-0 text-brand-cyan" />
                <p className="text-sm text-white/70">
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
                  className="px-4 py-1.5 text-sm rounded-lg text-white/60 hover:text-white/90 hover:bg-white/[0.06] transition-colors"
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

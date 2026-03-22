"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages } from "lucide-react";
import { useI18nStore, type Language } from "@/stores/i18nStore";

const languages: { code: Language; flag: string; label: string }[] = [
  { code: "ar", flag: "\uD83C\uDDF8\uD83C\uDDE6", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  { code: "zh", flag: "\uD83C\uDDE8\uD83C\uDDF3", label: "\u4E2D\u6587" },
  { code: "en", flag: "\uD83C\uDDFA\uD83C\uDDF8", label: "English" },
  { code: "hi", flag: "\uD83C\uDDEE\uD83C\uDDF3", label: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { code: "id", flag: "\uD83C\uDDEE\uD83C\uDDE9", label: "Bahasa" },
  { code: "ru", flag: "\uD83C\uDDF7\uD83C\uDDFA", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18nStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = languages.find((l) => l.code === language) ?? languages[2];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-white/[0.06] transition-all duration-200 focus-ring min-h-11"
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Languages className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="hidden sm:inline text-xs">{current.label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="listbox"
            aria-label="Select language"
            className="absolute right-0 top-full mt-2 z-50 min-w-[160px] overflow-hidden rounded-xl border border-white/[0.06] bg-background shadow-2xl backdrop-blur-xl"
          >
            {languages.map((lang) => {
              const isActive = lang.code === language;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150 ${
                    isActive
                      ? "bg-brand-cyan/8 text-foreground"
                      : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-cyan/70" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

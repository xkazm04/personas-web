"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, BookOpen } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { EYEBROW } from "@/lib/typography";
import { useTranslation } from "@/i18n/useTranslation";
import { TRIGGERS, triggerWords } from "./data";

interface TriggerDetailProps {
  activeId: string;
  /** Announce changes (the visitor chose this trigger); autoplay stays silent. */
  announce?: boolean;
}

/**
 * Side panel that describes the currently active trigger — label, description,
 * concrete firing condition, the persona it wakes, and a deep-link into the
 * guide for that trigger type. A polite live region only while the visitor is
 * driving, so the autoplay never talks over a screen reader.
 */

export default function TriggerDetail({ activeId, announce = false }: TriggerDetailProps) {
  const { t } = useTranslation();
  const copy = t.orchestrationSection;
  const activeTrigger = TRIGGERS.find((tr) => tr.id === activeId) ?? TRIGGERS[0];
  const words = triggerWords(copy, activeTrigger);
  const activeVar = BRAND_VAR[activeTrigger.brand];
  const Icon = activeTrigger.icon;

  return (
    <div className="flex flex-col gap-5">
      <div
        aria-live={announce ? "polite" : "off"}
        className="rounded-2xl border p-6"
        style={{
          borderColor: "var(--border-glass-hover)",
          backgroundColor: "rgba(var(--surface-overlay), 0.02)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTrigger.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: tint(activeTrigger.brand, 16) }}
              >
                <Icon className="h-5 w-5" style={{ color: activeVar }} />
              </div>
              <div>
                <div className={EYEBROW} style={{ color: activeVar }}>
                  {copy.trigger}
                </div>
                <div className="text-xl font-bold text-foreground">
                  {words.label}
                </div>
              </div>
            </div>

            <p className="text-base text-foreground/80 leading-relaxed mb-4">
              {words.description}
            </p>

            <div className="mb-4">
              <div className={`${EYEBROW} mb-1`}>
                {copy.firesWhen}
              </div>
              <div className="text-base font-mono text-foreground">
                {words.example}
              </div>
            </div>

            <div
              className="flex items-center gap-2 pt-4 border-t"
              style={{ borderColor: "var(--border-glass-hover)" }}
            >
              <span className={EYEBROW}>
                →
              </span>
              <div
                className="flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{
                  border: `1px solid ${tint("cyan", 30)}`,
                  backgroundColor: tint("cyan", 8),
                }}
              >
                <Bot className="h-4 w-4" style={{ color: BRAND_VAR.cyan }} />
                <span className="text-base font-semibold text-foreground">
                  {words.persona}
                </span>
              </div>
            </div>

            {activeTrigger.doc && (
              <Link
                href={activeTrigger.doc.href}
                className="mt-5 inline-flex items-center gap-1.5 text-base font-medium transition-opacity hover:opacity-80"
                style={{ color: activeVar }}
              >
                <BookOpen className="h-4 w-4" />
                <span>{words.docLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

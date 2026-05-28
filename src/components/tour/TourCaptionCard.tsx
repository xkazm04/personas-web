"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Play, Pause, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTour } from "@/contexts/TourContext";
import { useTranslation } from "@/i18n/useTranslation";
import { TRANSITION_NORMAL } from "@/lib/animations";
import AthenaCompanion from "./AthenaCompanion";
import TourVolumeControl from "./TourVolumeControl";

type Chapter = "home" | "features" | "dashboard";

function chapterFromPath(pathname: string): Chapter | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/features")) return "features";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  return null;
}

const BTN_BASE =
  "flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Floating narration + controls for the guided tour. Sits above the
 * spotlight overlay; auto-advance keeps running while it is shown.
 */
export default function TourCaptionCard() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { steps, stepIndex, playing, next, prev, goTo, togglePlay, exit } = useTour();
  if (steps.length === 0) return null;
  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const currentChapter = chapterFromPath(pathname);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t.tour.launch}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={TRANSITION_NORMAL}
      className="fixed inset-x-0 bottom-6 z-[90] mx-auto flex w-[min(94vw,36rem)] flex-col gap-4 rounded-2xl border border-glass-hover bg-surface/95 p-5 shadow-2xl backdrop-blur-md"
    >
      {/* Companion + narration — announced to assistive tech as it changes. */}
      <div className="flex items-start gap-3">
        <AthenaCompanion size={52} className="mt-0.5" />
        <div className="min-h-[3.75rem] flex-1" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={step.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={TRANSITION_NORMAL}
              className="text-base leading-relaxed text-foreground"
            >
              {t.tour[step.narration]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots — also jump-to controls. */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${i + 1} / ${steps.length}`}
            aria-current={i === stepIndex}
            className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 ${
              i === stepIndex
                ? "w-6 bg-brand-cyan"
                : "w-1.5 bg-foreground/25 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* Controls. */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={prev}
          disabled={isFirst}
          aria-label={t.tour.previous}
          className={`${BTN_BASE} border-glass text-muted-dark hover:border-glass-hover hover:text-foreground`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? t.tour.pause : t.tour.play}
          className={`${BTN_BASE} border-brand-cyan/50 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20`}
        >
          {playing ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={next}
          aria-label={t.tour.next}
          className={`${BTN_BASE} border-glass text-muted-dark hover:border-glass-hover hover:text-foreground`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <TourVolumeControl className="ml-auto" />

        <button
          type="button"
          onClick={exit}
          aria-label={t.tour.exit}
          className={`${BTN_BASE} border-glass text-muted-dark hover:border-glass-hover hover:text-foreground`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Chapter quick-nav — skip / switch between the three guided tours. */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-glass pt-3 text-sm">
        <span className="text-muted-dark">{t.tour.skipTo}</span>
        <ChapterButton label={t.tour.chapterHome} href="/?tour=1" active={currentChapter === "home"} />
        <ChapterButton label={t.nav.features} href="/features?tour=1" active={currentChapter === "features"} />
        <ChapterButton label={t.nav.dashboard} href="/demo?tour=1" active={currentChapter === "dashboard"} />
      </div>
    </motion.div>
  );
}

function ChapterButton({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => {
        if (typeof window !== "undefined") window.location.href = href;
      }}
      className={`rounded-full px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 ${
        active
          ? "bg-brand-cyan/15 text-brand-cyan"
          : "text-muted-dark hover:bg-white/[0.05] hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

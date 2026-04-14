"use client";

import { useRef, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { tools } from "./data";
import { useToolSelection } from "./useToolSelection";
import { useConnectorPath } from "./useConnectorPath";
import ToolGrid from "./components/ToolGrid";
import ToolDetailCard from "./components/ToolDetailCard";
import AgentArmyGrid from "./components/AgentArmyGrid";

export default function UseCases() {
  const { t } = useTranslation();
  const uid = useId();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const detailCardRef = useRef<HTMLDivElement | null>(null);

  const {
    selected,
    autoplay,
    progress,
    isMobile,
    desktopButtonRefs,
    mobileButtonRefs,
    handleManualClick,
    handleToolbarKeyDown,
  } = useToolSelection(!prefersReducedMotion);

  const { connectorPath, connectorVisible } = useConnectorPath(
    selected,
    isMobile,
    containerRef,
    detailCardRef,
    desktopButtonRefs,
    mobileButtonRefs,
  );

  const activeTool = tools.find((tl) => tl.id === selected);

  return (
    <SectionWrapper id="use-cases">
      <SectionIntro heading={t.useCasesSection.heading} gradient={t.useCasesSection.headingGradient} />

      <div ref={containerRef} className="mt-16 relative">
        <svg className="pointer-events-none absolute inset-0 z-5 h-full w-full overflow-visible">
          <defs>
            <linearGradient id={`${uid}-connectorGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={activeTool?.color || "rgba(6,182,212,0.5)"} stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.5)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.path
            d={connectorPath}
            initial={false}
            animate={{ opacity: connectorVisible && connectorPath ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            fill="none"
            stroke={`url(#${uid}-connectorGrad)`}
            strokeWidth="2"
            strokeDasharray="6 6"
            style={{ animation: "dash-flow 1.4s linear infinite" }}
          />
        </svg>

        <ToolGrid
          selected={selected}
          autoplay={autoplay}
          progress={progress}
          onManualClick={handleManualClick}
          onKeyDown={handleToolbarKeyDown}
          desktopRefs={desktopButtonRefs}
          mobileRefs={mobileButtonRefs}
        />

        <AnimatePresence mode="wait">
          {activeTool && (
            <ToolDetailCard
              key={activeTool.id}
              ref={detailCardRef}
              activeTool={activeTool}
              whatCanAutomateLabel={t.useCasesSection.whatCanAutomate}
            />
          )}
        </AnimatePresence>
      </div>

      <AgentArmyGrid />

      <motion.div variants={fadeUp} className="mt-12 flex justify-center">
        <Link
          href="/templates"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brand-cyan/30 bg-brand-cyan/5 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:border-brand-cyan/50 hover:bg-brand-cyan/10 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <LayoutGrid className="relative h-5 w-5 text-brand-cyan transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="relative">{t.useCasesSection.browseTemplates}</span>
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}

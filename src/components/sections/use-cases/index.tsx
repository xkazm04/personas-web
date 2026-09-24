"use client";

import { useId, useRef } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Lock } from "lucide-react";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { tools } from "./data";
import PersonaCard, { PERSONA } from "./components/PersonaCard";
import CapabilityLedger from "./components/PersonaLedger";
import ToolTabs from "./components/ToolTabs";
import { BEAT_MS, FIRST_BEAT_MS, usePersonaPlayback } from "./usePersonaPlayback";

/**
 * Use-cases, persona-card variant. Claim: one persona keeps its identity and
 * picks up many jobs across your tools. One app-style persona card; each tool
 * connected adds a tile to its connector row and that tool's real jobs to its
 * capabilities. Name, icon and colour never change. Plays through the eight
 * tools once on view (pausable); reduced motion shows every tool attached.
 */
export default function UseCasesPersonaCard() {
  const { t } = useTranslation();
  const still = useStillMotion();
  const uid = useId().replace(/:/g, "");
  const panelId = `${uid}-jobs`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pb = usePersonaPlayback(rootRef, still);
  const nextId = tools.find((tl) => !pb.attached.includes(tl.id))?.id ?? null;
  const totalJobs = tools.reduce((n, tl) => n + tl.useCases.length, 0);

  return (
    <SectionWrapper id="use-cases">
      <SectionIntro heading={t.useCasesSection.heading} gradient={t.useCasesSection.headingGradient} />

      <div
        ref={rootRef}
        role="group"
        aria-label={`One persona, ${PERSONA.name}, shown as its card. Connecting each of ${tools.length} tools adds that tool's jobs, ${totalJobs} in all, while the persona's name, icon and colour stay the same.`}
        data-tour-diagram="tools"
        className="mt-12 flex flex-col gap-8"
      >
        <ToolTabs
          uid={uid}
          panelId={panelId}
          attached={pb.attached}
          focus={pb.focus}
          nextId={nextId}
          beatMs={pb.step === 0 ? FIRST_BEAT_MS : BEAT_MS}
          ticking={pb.ticking}
          playing={pb.playing}
          complete={pb.complete}
          still={still}
          onChoose={pb.choose}
          onToggle={pb.toggle}
        />

        <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr] lg:gap-8">
          <div className="flex flex-col gap-3 lg:sticky lg:top-24">
            <PersonaCard attached={pb.attached} focus={pb.focus} still={still} />
            <div className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted">
              <Lock className="mt-0.5 h-3 w-3 shrink-0 text-brand-cyan" aria-hidden />
              <p>
                Same name, same icon, same colour through every tool. Connecting a tool only adds jobs to this one
                persona.
              </p>
            </div>
          </div>
          <CapabilityLedger
            attached={pb.attached}
            focus={pb.focus}
            still={still}
            panelId={panelId}
            labelledBy={pb.focus ? `${uid}-tool-${pb.focus}` : undefined}
          />
        </div>
      </div>

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

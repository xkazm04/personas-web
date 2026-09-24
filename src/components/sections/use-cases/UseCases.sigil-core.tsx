"use client";

import { useId, useRef } from "react";
import { useInView } from "framer-motion";
import { LayoutGrid, Pause, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import { tools } from "./data";
import { PERSONA, TOOL_COUNT, jobsFor, useAttachSequence } from "./UseCases.sigil-core.model";
import SigilStage from "./UseCases.sigil-core.stage";
import JobsPanel, { type LocalTool } from "./UseCases.sigil-core.panel";

/**
 * Use-cases, "sigil-core" direction. Claim: one persona keeps its identity and
 * picks up many jobs across your tools. The persona's sigil sits fixed in the
 * centre; the eight real tools ring it as ports. On first view the persona
 * plugs them in one at a time (one beat each, once), the Apps and What petals
 * fill, and each tool's jobs join the persona's capabilities while its name,
 * colour and sigil never change. Reduced motion and the server render show the
 * completed state: all eight plugged in, every job counted.
 */
export default function UseCasesSigilCore() {
  const { t } = useTranslation();
  const still = useStillMotion();
  const uid = useId().replace(/:/g, "");
  const panelId = `usecases-sigil-panel-${uid}`;
  const idPrefix = `usecases-sigil-${uid}`;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(stageRef, { once: true, amount: 0.45 });
  const { attached, selected, playing, armed, choose, toggle } = useAttachSequence(still, inView);

  // Localised tool names and jobs; data.ts is the fallback.
  const byId = t.useCasesSection as unknown as Record<string, LocalTool | undefined>;
  const local: LocalTool[] = tools.map((tl) => byId[tl.id] ?? { name: tl.name, cases: tl.useCases });
  const names = local.map((l) => l.name);
  const summary =
    `Persona sigil for the sample persona ${PERSONA.name}, fixed at the centre, with ${TOOL_COUNT} tools around it: ` +
    `${names.join(", ")}. Each tool it uses adds its jobs to the same persona: ${jobsFor(TOOL_COUNT)} jobs in all.`;
  const done = attached >= TOOL_COUNT;

  return (
    <SectionWrapper id="use-cases">
      <SectionIntro
        heading={t.useCasesSection.heading}
        gradient={t.useCasesSection.headingGradient}
        description={t.useCasesSection.description}
      />

      <figure data-tour-diagram="tools" className="mt-4" aria-label={summary}>
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10">
          <div ref={stageRef} className="relative mx-auto w-full max-w-[460px]">
            <SigilStage
              names={names}
              attached={attached}
              selected={selected}
              armed={armed}
              onChoose={choose}
              idPrefix={idPrefix}
              panelId={panelId}
            />
            {!still && (
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : done ? "Replay" : "Play"}
                className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-md border border-glass bg-white/[0.03] px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-glass-hover hover:text-foreground"
              >
                {playing ? <Pause className="h-3 w-3" aria-hidden /> : done ? <RotateCcw className="h-3 w-3" aria-hidden /> : <Play className="h-3 w-3" aria-hidden />}
                {playing ? "Pause" : done ? "Replay" : "Play"}
              </button>
            )}
          </div>

          <JobsPanel
            local={local}
            attached={attached}
            selected={selected}
            armed={armed}
            playing={playing}
            eyebrow={t.useCasesSection.whatCanAutomate}
            panelId={panelId}
            labelledBy={`${idPrefix}-port-${selected}`}
          />
        </div>

        <figcaption className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">
          One sigil, one name. Every tool you plug in fills its Apps and What petals and adds
          jobs to the same persona. The petals are the persona&apos;s eight dimensions, as the app
          draws them.
        </figcaption>
      </figure>

      <div className="mt-12 flex justify-center">
        <Link
          href="/templates"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brand-cyan/30 bg-brand-cyan/5 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:border-brand-cyan/50 hover:bg-brand-cyan/10 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <LayoutGrid className="relative h-5 w-5 text-brand-cyan transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="relative">{t.useCasesSection.browseTemplates}</span>
        </Link>
      </div>
    </SectionWrapper>
  );
}

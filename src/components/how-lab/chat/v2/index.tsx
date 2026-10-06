"use client";

import { useRef } from "react";
import { User } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { useTranslation } from "@/i18n/useTranslation";
import ScenarioBar from "../shared/ScenarioBar";
import { ZOOM_FILL, ZOOM_TIERS, zoomStyle } from "../shared/zoom";
import { useStoryClock } from "../shared/useStoryClock";
import { CUSTOMER, SCENARIOS, SCRIPT, endOf, fill, mix } from "../shared/scenarios";
import ReadingPanel from "./ReadingPanel";
import ScriptedReading from "./ScriptedReading";
import AgentReading from "./AgentReading";
import { OUTCOME_AT, SCAN_SPAN, STORY_LENGTH, VERDICT_AT, scanWords } from "./timing";

/**
 * How lab chat V2 - "What each one heard". The same customer message, typeset
 * twice at display size. The scripted bot checks it word by word against the
 * short list of words it knows: two light up, the rest is blacked out. The
 * agent reads the same words and marks what they mean - what was taken back,
 * the correction, the real ask. Then each says what it heard, and what the
 * customer got. The difference in intelligence is the difference in reading.
 */
export default function HowLabChatV2() {
  const c = useTranslation().t.howLab.chat;
  const artRef = useRef<HTMLDivElement>(null);
  const clock = useStoryClock(artRef, { count: SCENARIOS.length, length: () => STORY_LENGTH, rate: 1, dwell: 4.5 });
  const s = SCENARIOS[clock.index];
  const copy = c.scenarios[clock.index];
  const read = c.v2.scenarios[clock.index];
  const words = scanWords(read.segments, c.v2.keywords);
  const step = SCAN_SPAN / words.length;
  const matched = new Set(words.filter((w) => w.key && clock.t >= w.at).map((w) => w.text.toLowerCase().replace(/[^a-z0-9]/g, "")));
  const verdict = clock.t >= VERDICT_AT;
  const outcome = clock.t >= OUTCOME_AT;

  return (
    <SectionWrapper fit="fill" id="agents-chat" aria-label={c.aria} className={ZOOM_TIERS}>
      <SectionIntro heading={c.heading} gradient={c.gradient} description={c.lede} descriptionMaxWidth="max-w-3xl" className="mb-8" />
      <ScenarioBar clock={clock} className="mb-4 stage:mb-[clamp(0.75rem,2svh,1.5rem)]" />
      <div data-stage-slot>
        <figure ref={artRef} aria-label={c.v2.artLabel} className={`relative m-0 flex flex-col gap-3 ${ZOOM_FILL}`} style={zoomStyle}>
          <ReadingPanel
            kind="scripted"
            name={c.scripted}
            mode={c.v2.scriptedReads}
            verdictLabel={c.v2.heard}
            verdict={read.heard}
            outcome={copy.scriptedOutcome}
            showVerdict={verdict}
            showOutcome={outcome}
            aside={
              <div className="hidden flex-wrap items-center gap-2 md:flex">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{c.v2.vocabulary}</span>
                <span className="flex flex-wrap gap-1">
                  {c.v2.keywords.map((k) => {
                    const on = matched.has(k);
                    return (
                      <span key={k} className="rounded px-1.5 py-0.5 font-mono text-xs transition-colors duration-300" style={{ background: on ? SCRIPT : mix(SCRIPT, 8), color: on ? "var(--background)" : "var(--muted)" }}>
                        {k}
                      </span>
                    );
                  })}
                </span>
              </div>
            }
          >
            <ScriptedReading words={words} t={clock.t} step={step} />
          </ReadingPanel>

          {/* The seam: the same words go to both. */}
          <span className="pointer-events-none absolute left-1/2 top-1/2 z-[1] hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-[0.14em] md:flex" style={{ borderColor: mix(CUSTOMER, 45), background: "var(--background)", color: CUSTOMER }}>
            <User className="h-3.5 w-3.5" aria-hidden />
            {c.customer}
          </span>

          <ReadingPanel
            kind="agent"
            name={c.agent}
            mode={c.v2.agentReads}
            verdictLabel={c.v2.understood}
            verdict={read.understood}
            outcome={`${copy.agentOutcome} ${fill(c.inSeconds, endOf(s.agent))}`}
            showVerdict={verdict}
            showOutcome={outcome}
            aside={<span className="hidden text-xs font-medium uppercase tracking-[0.12em] text-muted md:block">{c.v2.everyWord}</span>}
          >
            <AgentReading segments={read.segments} roles={s.segments} tags={read.tags} t={clock.t} />
          </ReadingPanel>
        </figure>
      </div>
    </SectionWrapper>
  );
}

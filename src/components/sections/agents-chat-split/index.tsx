"use client";

import { useRef } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { useTranslation } from "@/i18n/useTranslation";
import ScenarioBar from "./shared/ScenarioBar";
import { ZOOM_FILL, ZOOM_TIERS, zoomStyle } from "./shared/zoom";
import { useStoryClock } from "./shared/useStoryClock";
import { SCENARIOS, storyEnd } from "./shared/scenarios";
import CustomerFork from "./CustomerFork";
import ChatWindow from "./ChatWindow";
import ClockSpine from "./ClockSpine";

/**
 * How lab chat V1 - "Split screen, one clock". The live concept kept and
 * re-crafted: one customer message (top) forks into two live conversations
 * side by side - a scripted bot on the left that answers in template
 * monospace, an agent on the right that answers in plain speech - with one
 * shared clock between them. The agent's window resolves and lights while the
 * script is still failing; the script ends handing off to a human.
 */
const OUTRO = 1.6;

export default function HowLabChatV1() {
  const c = useTranslation().t.howSections.chat;
  const artRef = useRef<HTMLDivElement>(null);
  const clock = useStoryClock(artRef, {
    count: SCENARIOS.length,
    length: (i) => storyEnd(SCENARIOS[i]) + OUTRO,
    rate: 2.4,
    dwell: 7,
  });
  const s = SCENARIOS[clock.index];
  const copy = c.scenarios[clock.index];

  return (
    <SectionWrapper fit="fill" id="agents-chat" aria-label={c.aria} className={ZOOM_TIERS}>
      <SectionIntro heading={c.heading} gradient={c.gradient} description={c.lede} descriptionMaxWidth="max-w-3xl" className="mb-8" />
      <ScenarioBar clock={clock} className="mb-4 stage:mb-[clamp(0.75rem,2svh,1.5rem)]" />
      <div data-stage-slot>
        <figure ref={artRef} aria-label={c.v1.artLabel} className={`m-0 flex flex-col ${ZOOM_FILL}`} style={zoomStyle}>
          <CustomerFork key={clock.index} label={c.customer} message={copy.message} still={clock.still} />
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_5.5rem_1fr] md:gap-0">
            <ChatWindow kind="scripted" lines={s.scripted} texts={copy.scripted} t={clock.t} stars={s.stars.scripted} outcome={copy.scriptedOutcome} still={clock.still} running={clock.running} runKey={clock.index} />
            <ClockSpine scenario={s} t={clock.t} label={c.v1.clock} />
            <ChatWindow kind="agent" lines={s.agent} texts={copy.agent} t={clock.t} stars={s.stars.agent} outcome={copy.agentOutcome} still={clock.still} running={clock.running} runKey={clock.index} />
          </div>
        </figure>
      </div>
    </SectionWrapper>
  );
}

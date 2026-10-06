"use client";

import { useMemo, useRef, type CSSProperties } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { useTranslation } from "@/i18n/useTranslation";
import ScenarioBar from "../shared/ScenarioBar";
import { ZOOM_TIERS } from "../shared/zoom";
import { useStoryClock } from "../shared/useStoryClock";
import { SCENARIOS, endOf } from "../shared/scenarios";
import TrackMap from "./TrackMap";
import Labels from "./Labels";
import { AGENT_MARKS, AGENT_PTS, H, W, agentTimes, distanceAt, lengths, pointAt, scriptedKeys, trackRoute } from "./geometry";

/**
 * How lab chat V3 - "Tracks vs the way". The scripted bot drawn as what it
 * is: a map of fixed tracks. The customer's message enters at the left, a
 * keyword switch sends it down one track, it stops at each scripted station,
 * hits the bumper where the rule runs out and drains into the human queue.
 * From the same origin the agent's route lifts over the tracks, passes three
 * thoughts and lands on "resolved" - long before the train stops. One clock
 * runs both; reduced motion shows both journeys complete.
 */
const AGENT_CUM = lengths(AGENT_PTS);

export default function HowLabChatV3() {
  const c = useTranslation().t.howLab.chat;
  const artRef = useRef<HTMLDivElement>(null);
  const clock = useStoryClock(artRef, {
    count: SCENARIOS.length,
    length: (i) => endOf(SCENARIOS[i].scripted) + 0.8,
    rate: 2.2,
    dwell: 7,
  });
  const s = SCENARIOS[clock.index];
  const t = clock.t;

  const { pts, cum, keys } = useMemo(() => {
    const r = trackRoute(s.track);
    return { pts: r.pts, cum: lengths(r.pts), keys: scriptedKeys(s, r.marks) };
  }, [s]);
  const aTimes = agentTimes(s);
  const aKeys = AGENT_MARKS.map((v, i) => ({ at: aTimes[i], v }));

  const trainD = distanceAt(cum, keys, t);
  const agentD = distanceAt(AGENT_CUM, aKeys, t);
  const passed = s.scripted.filter((l) => l.at <= t).length; // 0..5: stations, then bumper, then queue
  const beadsLit = aTimes.slice(0, 3).filter((a) => a <= t).length;
  const resolved = t >= aTimes[3];
  const queued = t >= endOf(s.scripted);

  return (
    <SectionWrapper fit="fill" id="agents-chat" aria-label={c.aria} className={ZOOM_TIERS}>
      <SectionIntro heading={c.heading} gradient={c.gradient} description={c.lede} descriptionMaxWidth="max-w-3xl" className="mb-8" />
      <ScenarioBar clock={clock} className="mb-4 stage:mb-[clamp(0.5rem,1.6svh,1.25rem)]" />
      {/* Phones: the message sits above the map, which scrolls sideways. */}
      <p className="mx-auto mb-3 max-w-xl rounded-2xl border border-glass px-4 py-3 text-base leading-snug text-foreground md:hidden">&ldquo;{c.scenarios[clock.index].message}&rdquo;</p>
      <div data-stage-slot>
        <div ref={artRef} data-stage-art className="relative mx-auto w-full overflow-x-auto md:overflow-visible" style={{ "--art-ar": W / H } as CSSProperties}>
          <div className="relative w-full min-w-[52rem] md:min-w-0 [container-type:inline-size]" style={{ aspectRatio: `${W} / ${H}` }}>
            <TrackMap
              row={s.track}
              route={pts}
              routeTotal={cum[cum.length - 1]}
              trainD={trainD}
              train={pointAt(pts, cum, trainD)}
              agentD={agentD}
              agentTotal={AGENT_CUM[AGENT_CUM.length - 1]}
              agent={pointAt(AGENT_PTS, AGENT_CUM, agentD)}
              passed={Math.min(passed, 3)}
              beadsLit={beadsLit}
              queued={queued}
              resolved={resolved}
              label={c.v3.artLabel}
            />
            <Labels index={clock.index} row={s.track} passed={passed} beadsLit={beadsLit} queued={queued} resolved={resolved} t={Math.min(t, endOf(s.scripted))} agentEnd={endOf(s.agent)} />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LnKeyButton } from "../shared/LnKey";
import LnSectionHead from "../shared/LnSectionHead";
import TeamStrip from "./TeamStrip";
import { useTeamRun, type ChannelKind, type MasterKind } from "./useTeamRun";
import "./team.css";

const TILTS = ["-1.5deg", "1deg", "-.8deg", "1.6deg"];

/** The team canvas as a four-channel mixer: set the goal, run the team, get one reviewed result. */
export default function LandingTeam() {
  const { t } = useTranslation();
  const c = t.landingNext.team;
  const { state, running, run } = useTeamRun();

  const channelText = (kind: ChannelKind, i: number) =>
    kind === "work" ? `${c.working[i]}…` : kind === "done" ? `${c.status.done} ✓` : c.status.idle;
  const masterText = (kind: MasterKind) => {
    switch (kind) {
      case "fanOut":
        return `${c.status.fanOut} →`;
      case "working":
        return `${c.status.working}…`;
      case "converge":
        return `← ${c.status.converge}`;
      case "result":
        return `${c.status.result} ✓`;
      default:
        return c.status.ready;
    }
  };

  return (
    <section id="team-canvas" className="ln-sec" aria-labelledby="team-canvas-h">
      <div className="ln-wrap">
        <LnSectionHead kicker={c.kicker} headingId="team-canvas-h" heading={c.heading} accent={c.accent} lede={c.lede} />
        <div className="ln-mixer" role="group" aria-label={c.groupLabel}>
          {c.channels.map((name, i) => (
            <TeamStrip
              key={name}
              tape={name}
              tilt={TILTS[i]}
              status={channelText(state.channels[i].kind, i)}
              level={state.channels[i].lvl}
              fader={state.channels[i].fad}
              silk={`${c.strip} ${i + 1}`}
            />
          ))}
          <TeamStrip
            master
            tape={c.goal}
            status={masterText(state.master.kind)}
            level={state.master.lvl}
            fader={state.master.fad}
            silk={c.masterSilk}
          >
            <div className="ln-mix-go">
              <LnKeyButton
                tone="signal"
                icon="i-play"
                className={running ? "ln-is-down" : undefined}
                aria-disabled={running}
                onClick={run}
              >
                {c.run}
              </LnKeyButton>
            </div>
          </TeamStrip>
        </div>
        <div className="ln-team-flow">
          <span className="ln-caption">{c.captionA}</span>
          <span className="ln-caption">{c.captionB}</span>
        </div>
      </div>
    </section>
  );
}

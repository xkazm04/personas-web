"use client";

import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY, type ConnectState } from "../data";
import type { Rect } from "../layout";
import { atStage, type ModuleStage } from "../stages";
import { StatePill } from "./primitives";
import { DrawCheck, Flash, Part, Spinner } from "./parts";
import { ModuleReveal, TargetPanel } from "./shell";

/**
 * The connector list, built in three passes: the panel and its header frame
 * up while she is still crossing (shell), the row frames and their glyph +
 * name cascade in as she lands (body, one row behind the next), and the
 * account details and state pills fill on the bracket lock (detail).
 *
 * The Slack row is the second setup target, and the choice made there is a
 * handshake you watch happen — connect → a spinning arc → a check that draws
 * itself, with one bright wash across the row and the panel's own count
 * ticking up behind it.
 */

/** Backing panel — rows are positioned over it so brackets stay pixel-true. */
export function ConnectorPanel({
  rect,
  stage,
  connected,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  connected: boolean;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  return (
    <ModuleReveal
      rect={rect}
      stage={stage}
      reduced={reduced}
      className="flex flex-col rounded-xl border border-glass px-3 py-2.5"
    >
      <span className="flex items-baseline gap-2">
        <Part show i={0} reduced={reduced} className={`${ANNOTATION_DIM} normal-case`}>
          {c.connectLabel}
        </Part>
        <Part
          show
          i={1}
          reduced={reduced}
          className="ml-auto hidden truncate text-base text-muted-dark sm:block"
        >
          {connected ? c.connectCountDone : c.connectCount}
        </Part>
      </span>
    </ModuleReveal>
  );
}

/** The Slack row — a setup target, so it lives in a TargetPanel. */
export function SlackRow({
  rect,
  stage,
  state,
  locked,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  state: ConnectState;
  locked: boolean;
  reduced: boolean;
}) {
  const s = COPY.canvas.slack;
  const connected = state === "connected";
  return (
    <TargetPanel
      rect={rect}
      stage={stage}
      locked={locked}
      reduced={reduced}
      from="body"
      ghost={false}
      className="items-center gap-2 px-2.5"
    >
      <Flash on={connected} reduced={reduced} />
      <RowBody glyph={s.glyph} name={s.name} detail={s.detail} stage={stage} reduced={reduced} />
      <Part show={atStage(stage, "detail")} i={2} reduced={reduced} className="flex shrink-0">
        <StatePill
          tone={connected ? "ok" : "brand"}
          label={s[state]}
          glyph={
            state === "connecting" ? (
              <Spinner reduced={reduced} className="h-3 w-3" />
            ) : connected ? (
              <DrawCheck reduced={reduced} className="h-3 w-3 shrink-0" delay={0.1} />
            ) : undefined
          }
          reduced={reduced}
        />
      </Part>
    </TargetPanel>
  );
}

/** An already-connected tool — same anatomy, settled state. `lead` walks the
 *  rows in one after another instead of dropping the list in as a block. */
export function ConnectorRow({
  rect,
  chip,
  stage,
  lead,
  reduced,
}: {
  rect: Rect;
  chip: (typeof COPY.canvas.chips)[number];
  stage: ModuleStage;
  lead: number;
  reduced: boolean;
}) {
  return (
    <ModuleReveal
      rect={rect}
      stage={stage}
      reduced={reduced}
      from="body"
      ghost={false}
      lead={lead}
      className="flex items-center gap-2 rounded-xl border border-glass px-2.5"
    >
      <RowBody
        glyph={chip.glyph}
        name={chip.name}
        detail={chip.detail}
        stage={stage}
        lead={lead}
        reduced={reduced}
        dim
      />
      <Part show={atStage(stage, "detail")} i={2} lead={lead} reduced={reduced} className="flex shrink-0">
        <StatePill tone="ok" label={chip.state} />
      </Part>
    </ModuleReveal>
  );
}

/** Glyph + name + account detail — the left side of every connector row. */
function RowBody({
  glyph,
  name,
  detail,
  stage,
  lead = 0,
  reduced,
  dim,
}: {
  glyph: string;
  name: string;
  detail: string;
  stage: ModuleStage;
  lead?: number;
  reduced: boolean;
  dim?: boolean;
}) {
  return (
    <>
      <Part
        show={atStage(stage, "body")}
        i={0}
        lead={lead}
        reduced={reduced}
        className={dim ? "flex shrink-0 opacity-70" : "flex shrink-0"}
      >
        <ConnectorIcon src={glyph} size={18} />
      </Part>
      <Part
        show={atStage(stage, "body")}
        i={1}
        lead={lead}
        reduced={reduced}
        className={`min-w-0 flex-1 truncate text-base font-medium ${dim ? "text-foreground/70" : "text-foreground"}`}
      >
        {name}
      </Part>
      <Part
        show={atStage(stage, "detail")}
        i={1}
        lead={lead}
        reduced={reduced}
        className="hidden shrink-0 truncate text-base text-muted-dark md:block"
      >
        {detail}
      </Part>
    </>
  );
}

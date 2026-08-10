"use client";

import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY, type ConnectState } from "../data";
import type { Rect } from "../layout";
import { StatePill } from "./primitives";
import { ModuleReveal, TargetPanel } from "./shell";

/**
 * The connector list: a backing panel with a real header (label + connected
 * count) and rows carrying the genuine brand glyph, the account detail the
 * product would show, and a live connection state.
 *
 * The Slack row is the second setup target, and the choice made there is a
 * handshake you watch happen — connect → connecting… → connected — with the
 * panel's own count ticking up behind it. All three rows arrive together, so
 * the rows need no skeleton of their own: the panel's already holds the rect.
 */

/** Backing panel — rows are positioned over it so brackets stay pixel-true. */
export function ConnectorPanel({
  rect,
  shown,
  connected,
  reduced,
}: {
  rect: Rect;
  shown: boolean;
  connected: boolean;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  return (
    <ModuleReveal
      rect={rect}
      shown={shown}
      reduced={reduced}
      className="flex flex-col rounded-xl border border-glass px-3 py-2.5"
    >
      <span className="flex items-baseline gap-2">
        <span className={`${ANNOTATION_DIM} normal-case`}>{c.connectLabel}</span>
        <span className="ml-auto hidden truncate text-base text-muted-dark sm:block">
          {connected ? c.connectCountDone : c.connectCount}
        </span>
      </span>
    </ModuleReveal>
  );
}

/** The Slack row — a setup target, so it lives in a TargetPanel. */
export function SlackRow({
  rect,
  shown,
  state,
  locked,
  reduced,
}: {
  rect: Rect;
  shown: boolean;
  state: ConnectState;
  locked: boolean;
  reduced: boolean;
}) {
  const s = COPY.canvas.slack;
  const connected = state === "connected";
  return (
    <TargetPanel
      rect={rect}
      shown={shown}
      locked={locked}
      reduced={reduced}
      ghost={false}
      className="items-center gap-2 px-2.5"
    >
      <RowBody glyph={s.glyph} name={s.name} detail={s.detail} />
      <StatePill
        tone={connected ? "ok" : "brand"}
        label={s[state]}
        pulse={state === "connecting"}
        reduced={reduced}
      />
    </TargetPanel>
  );
}

/** An already-connected tool — same anatomy, settled state. */
export function ConnectorRow({
  rect,
  chip,
  shown,
  reduced,
}: {
  rect: Rect;
  chip: (typeof COPY.canvas.chips)[number];
  shown: boolean;
  reduced: boolean;
}) {
  return (
    <ModuleReveal
      rect={rect}
      shown={shown}
      reduced={reduced}
      ghost={false}
      className="flex items-center gap-2 rounded-xl border border-glass px-2.5"
    >
      <RowBody glyph={chip.glyph} name={chip.name} detail={chip.detail} dim />
      <StatePill tone="ok" label={chip.state} />
    </ModuleReveal>
  );
}

/** Glyph + name + account detail — the left side of every connector row. */
function RowBody({
  glyph,
  name,
  detail,
  dim,
}: {
  glyph: string;
  name: string;
  detail: string;
  dim?: boolean;
}) {
  return (
    <>
      <span className={dim ? "shrink-0 opacity-70" : "shrink-0"}>
        <ConnectorIcon src={glyph} size={18} />
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-base font-medium ${dim ? "text-foreground/70" : "text-foreground"}`}
      >
        {name}
      </span>
      <span className="hidden shrink-0 truncate text-base text-muted-dark md:block">{detail}</span>
    </>
  );
}

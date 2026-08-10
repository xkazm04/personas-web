"use client";

import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY, type ConnectState } from "../data";
import type { Rect } from "../layout";
import { StatePill, TargetPanel, rectStyle } from "./primitives";

/**
 * The connector list: a backing panel with a real header (label + connected
 * count) and rows carrying the genuine brand glyph, the account detail the
 * product would show, and a live connection state.
 *
 * The Slack row is the walkthrough's second target and changes state as she
 * narrates it — connect → connecting… → connected — so the scene shows a
 * handshake happening rather than a static label.
 */

/** Backing panel — rows are positioned over it so brackets stay pixel-true. */
export function ConnectorPanel({ rect }: { rect: Rect }) {
  const c = COPY.canvas;
  return (
    <div
      className="absolute flex flex-col rounded-xl border border-glass px-3 py-2.5"
      style={rectStyle(rect)}
    >
      <span className="flex items-baseline gap-2">
        <span className={`${ANNOTATION_DIM} normal-case`}>{c.connectLabel}</span>
        <span className="ml-auto hidden truncate text-base text-muted-dark sm:block">
          {c.connectCount}
        </span>
      </span>
    </div>
  );
}

/** The Slack row — a walkthrough target, so it lives in a TargetPanel. */
export function SlackRow({
  rect,
  state,
  locked,
  reduced,
}: {
  rect: Rect;
  state: ConnectState;
  locked: boolean;
  reduced: boolean;
}) {
  const s = COPY.canvas.slack;
  const connected = state === "connected";
  return (
    <TargetPanel rect={rect} locked={locked} className="items-center gap-2 px-2.5">
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
}: {
  rect: Rect;
  chip: (typeof COPY.canvas.chips)[number];
}) {
  return (
    <div
      className="absolute flex items-center gap-2 rounded-xl border border-glass px-2.5"
      style={rectStyle(rect)}
    >
      <RowBody glyph={chip.glyph} name={chip.name} detail={chip.detail} dim />
      <StatePill tone="ok" label={chip.state} />
    </div>
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

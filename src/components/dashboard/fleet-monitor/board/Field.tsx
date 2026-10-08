"use client";

import { Fragment, type CSSProperties } from "react";
import type { FleetTeam } from "../fleet-data";
import { countAttention, needsTone } from "../attention";
import Tile, { type Rect } from "./Tile";
import HoverCard from "./HoverCard";
import { fill, gridFit, orderInBay, plural, type SimAgent } from "./model";
import type { BoardCopy } from "./copy";
import type { BoardNav } from "./useBoardNav";
import { inFlightFor, type Command } from "./useCommands";
import s from "./tiles.module.css";

interface FieldProps {
  width: number;
  height: number;
  teams: FleetTeam[];
  scope: SimAgent[];
  nav: BoardNav;
  copy: BoardCopy;
  live: boolean;
  arriving: boolean;
  cmds: readonly Command[];
  hostName: string;
}

const EDGE = 10;
const GAP = 10;
const HEAD = 28;
const PAD = 6;
/** Narrowest tile that still shows a 4-character callsign whole at 12px. */
const MIN_TILE_W = 56;

/** Bays edge to edge in a 1-, 2- or 3-column grid; each bay's tiles in reading order. */
export function computeLayout(teams: FleetTeam[], scope: SimAgent[], w: number, h: number) {
  const n = teams.length;
  const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const bw = (w - 2 * EDGE - (cols - 1) * GAP) / cols;
  const bh = (h - 2 * EDGE - (rows - 1) * GAP) / rows;
  const bays: Record<string, Rect> = {};
  const tiles: Record<string, Rect & { j: number }> = {};
  const order: Record<string, SimAgent[]> = {};
  teams.forEach((t, i) => {
    const x = EDGE + (i % cols) * (bw + GAP);
    const y = EDGE + Math.floor(i / cols) * (bh + GAP);
    bays[t.id] = { x, y, w: bw, h: bh };
    const list = orderInBay(scope.filter((a) => a.team === t.id));
    order[t.id] = list;
    const iw = bw - 2 * PAD, ih = bh - HEAD - PAD;
    const g = list.length > 6 ? 6 : 10;
    const fit = gridFit(list.length, iw, ih, g, 320, 240, MIN_TILE_W);
    const gw = fit.cols * fit.tw + (fit.cols - 1) * g;
    const gh = fit.rows * fit.th + (fit.rows - 1) * g;
    const ox = x + PAD + (iw - gw) / 2;
    const oy = y + HEAD + (ih - gh) / 2;
    list.forEach((a, j) => {
      tiles[a.id] = { x: ox + (j % fit.cols) * (fit.tw + g), y: oy + Math.floor(j / fit.cols) * (fit.th + g), w: fit.tw, h: fit.th, j };
    });
  });
  return { bays, tiles, order };
}

/** L0: the whole fleet, nine team bays filling the field. */
export default function Field({ width, height, teams, scope, nav, copy, live, arriving, cmds, hostName }: FieldProps) {
  if (width <= 0 || height <= 0) return null;
  const layout = computeLayout(teams, scope, width, height);
  const hovered = nav.att?.type === "agent" ? scope.find((a) => a.id === nav.att!.id) : undefined;

  return (
    <>
      {teams.map((t, ti) => {
        const B = layout.bays[t.id];
        const list = layout.order[t.id];
        const c = countAttention(list);
        const isAtt = nav.att?.type === "team" && nav.att.id === t.id;
        const agentsText = fill(plural(list.length, copy.bay.agentsCountOne, copy.bay.agentsCount), { n: list.length });
        const needText = fill(plural(c.needs, copy.bay.needCountOne, copy.bay.needCount), { n: c.needs });
        return (
          <Fragment key={t.id}>
            <div
              className={`${s.bay} ${isAtt ? s.bayAtt : ""} ${arriving ? s.rise : ""}`}
              style={{ left: B.x, top: B.y, width: B.w, height: B.h, "--h": t.hue, "--ad": `${ti * 0.05}s` } as CSSProperties}
            >
              <button
                type="button"
                className="absolute inset-x-2 top-1 flex h-6 items-center gap-2 rounded-md px-1 text-left focus-visible:outline-2 focus-visible:outline-foreground"
                aria-label={fill(copy.bay.aria, { team: t.name, agents: agentsText, running: c.working, need: needText })}
                onMouseEnter={() => nav.attend({ type: "team", id: t.id })}
                onMouseLeave={nav.unattend}
                onFocus={() => nav.attend({ type: "team", id: t.id })}
                onBlur={nav.unattend}
                onClick={(e) => nav.openTeam(t.id, e.currentTarget)}
              >
                <i className={s.hueTick} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{t.name}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted-dark" aria-hidden="true">
                  {c.working > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <i className="h-1.5 w-1.5 rounded-full bg-[var(--at-working)]" />
                      {c.working}
                    </span>
                  )}
                  {c.needs > 0 && (
                    <span title={needText} className={`${c.critical ? s.needCountCritical : s.needCount} min-w-5 rounded px-1 text-center font-bold`}>
                      {c.needs}
                    </span>
                  )}
                </span>
              </button>
            </div>
            {list.map((a) => {
              const L = layout.tiles[a.id];
              return (
                <Tile
                  key={a.id}
                  agent={a}
                  rect={L}
                  copy={copy}
                  att={nav.att?.type === "agent" && nav.att.id === a.id}
                  live={live}
                  pending={!!inFlightFor(cmds, a.id)}
                  riseDelay={arriving ? 0.1 + ti * 0.05 + L.j * 0.015 : null}
                  onAttend={() => nav.attend({ type: "agent", id: a.id })}
                  onUnattend={nav.unattend}
                  onOpen={(el) => nav.openAgent(a.id, el)}
                />
              );
            })}
          </Fragment>
        );
      })}
      {hovered && layout.tiles[hovered.id] && (
        <HoverCard agent={hovered} anchor={layout.tiles[hovered.id]} width={width} height={height} copy={copy} live={live} tone={needsTone(hovered)} pending={inFlightFor(cmds, hovered.id)} hostName={hostName} />
      )}
    </>
  );
}

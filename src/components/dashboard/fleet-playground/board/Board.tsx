"use client";

import { Fragment, useMemo, type CSSProperties } from "react";
import type { FleetTeam } from "../fleet-data";
import Tile, { type Rect } from "./Tile";
import { fill, counts, gridFit, needs, plural, type SimAgent } from "./model";
import type { BoardCopy } from "./copy";
import type { BoardNav } from "./useBoardNav";
import s from "./tiles.module.css";

interface BoardProps {
  width: number;
  height: number;
  teams: FleetTeam[];
  scope: SimAgent[];
  nav: BoardNav;
  copy: BoardCopy;
  live: boolean;
  arriving: boolean;
}

const GAP = 12;
const HEAD = 36;
const PAD = 8;
/** Narrowest pillar that still shows a 4-character callsign whole at 12px. */
export const MIN_TILE_W = 48;

/** Bays in a 1-, 2- or 3-column grid; tiles packed per bay by `gridFit`. */
export function computeLayout(teams: FleetTeam[], scope: SimAgent[], w: number, h: number) {
  const n = teams.length;
  const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const bw = (w - (cols - 1) * GAP) / cols;
  const bh = (h - (rows - 1) * GAP) / rows;
  const bays: Record<string, Rect> = {};
  const tiles: Record<string, Rect & { j: number }> = {};
  teams.forEach((t, i) => {
    const x = (i % cols) * (bw + GAP);
    const y = Math.floor(i / cols) * (bh + GAP);
    bays[t.id] = { x, y, w: bw, h: bh };
    const list = scope.filter((a) => a.team === t.id);
    const ix = x + PAD, iy = y + HEAD, iw = bw - 2 * PAD, ih = bh - HEAD - PAD;
    const g = list.length > 6 ? 5 : 8;
    const fit = gridFit(list.length, iw, ih, g, 1e9, 1e9, MIN_TILE_W);
    const gw = fit.cols * fit.tw + (fit.cols - 1) * g;
    const gh = fit.rows * fit.th + (fit.rows - 1) * g;
    const ox = ix + (iw - gw) / 2;
    const oy = iy + Math.min(8, (ih - gh) / 2);
    list.forEach((a, j) => {
      tiles[a.id] = { x: ox + (j % fit.cols) * (fit.tw + g), y: oy + Math.floor(j / fit.cols) * (fit.th + g), w: fit.tw, h: fit.th, j };
    });
  });
  return { bays, tiles };
}

/** The fleet: one bay per team, every agent a tile. */
export default function Board({ width, height, teams, scope, nav, copy, live, arriving }: BoardProps) {
  const layout = useMemo(() => computeLayout(teams, scope, width, height), [teams, scope, width, height]);
  if (width <= 0 || height <= 0) return null;

  return (
    <>
      {teams.map((t, ti) => {
        const B = layout.bays[t.id];
        const list = scope.filter((a) => a.team === t.id);
        const c = counts(list);
        const nd = list.filter(needs).length;
        const isAtt = nav.att?.type === "team" && nav.att.id === t.id;
        const agentsText = fill(plural(list.length, copy.bay.agentsCountOne, copy.bay.agentsCount), { n: list.length });
        const needText = fill(plural(nd, copy.spot.needCountOne, copy.spot.needCount), { n: nd });
        return (
          <Fragment key={t.id}>
            <div
              className={`${s.bay} ${isAtt ? s.bayAtt : ""} ${arriving ? s.rise : ""}`}
              style={{ left: B.x, top: B.y, width: B.w, height: B.h, "--h": t.hue, "--ad": `${ti * 0.05}s` } as CSSProperties}
              onClick={(e) => {
                if (e.target === e.currentTarget) nav.openTeam(t.id, e.currentTarget.querySelector("button"));
              }}
            >
              <button
                type="button"
                className="absolute inset-x-3 top-2 flex h-7 items-center gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-foreground"
                aria-label={fill(copy.bay.aria, { team: t.name, agents: agentsText, running: c.running, need: needText })}
                onMouseEnter={() => nav.attend({ type: "team", id: t.id })}
                onMouseLeave={nav.unattend}
                onFocus={() => nav.attend({ type: "team", id: t.id })}
                onBlur={nav.unattend}
                onClick={(e) => nav.openTeam(t.id, e.currentTarget)}
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{t.name}</span>
                {/* The name has priority: the counts stay numeric (the button's
                    label spells them out), the agent count only where it fits. */}
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-dark" aria-hidden="true">
                  {c.running > 0 && (
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <i className={s.runDot} aria-hidden="true" />
                      {c.running}
                    </span>
                  )}
                  {nd > 0 ? (
                    <span title={needText} className={`${s.needPill} min-w-6 rounded-md px-1.5 py-0.5 text-center font-semibold tabular-nums`}>{nd}</span>
                  ) : (
                    B.w >= 300 && <span>{agentsText}</span>
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
                  flash={nav.flashId === a.id}
                  live={live}
                  riseDelay={arriving ? 0.1 + ti * 0.06 + L.j * 0.018 : null}
                  onAttend={() => nav.attend({ type: "agent", id: a.id })}
                  onUnattend={nav.unattend}
                  onOpen={(el) => nav.openAgent(a.id, el)}
                />
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
}

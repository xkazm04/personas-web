import type { KeyboardEvent, MouseEvent } from "react";
import { BAND_R, DAY_BANDS, MINUTES, NUMERALS, RUN_R, SETUP_ARC, SETUP_DOTS, TICKS, beadTransform } from "./art";
import { C } from "./geometry";
import { RUN_COLORS, RUN_HOURS, RUN_TIMES, TOOLS } from "./data";
import { TOOL_PATHS } from "./tool-paths";
import { fill, type ClockCopy } from "./copy";
import s from "./clock.module.css";

export type Opener = (e: MouseEvent<Element> | KeyboardEvent<Element>, el: Element) => void;

interface BeadProps {
  h: number;
  label: string;
  aria: string;
  color: string;
  mark?: string;
  tool?: boolean;
  on?: boolean;
  onOpen: Opener;
}

/** A tappable bead on the agent's ring; its time label culls with the dial's turn. */
function Bead({ h, label, aria, color, mark, tool, on, onOpen }: BeadProps) {
  return (
    <g
      className={`${s.bead}${tool ? ` ${s.tbead}` : ""}`}
      role="button"
      tabIndex={0}
      aria-label={aria}
      transform={beadTransform(h)}
      style={{ color }}
      data-on={on ? "" : undefined}
      data-cull-h={h}
      data-cull-r={RUN_R}
      data-cull-pad={32}
      onClick={(e) => onOpen(e, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(e, e.currentTarget);
        }
      }}
    >
      <circle r={20} className={s.halo} />
      <circle r={mark ? 13 : 9.5} className={s.core} />
      {mark && <path d={mark} className={s.mk} transform="translate(-7.2 -7.2) scale(.6)" />}
      <text x={0} y={mark ? 30 : 26} className={s.lbl}>
        {label}
      </text>
      <circle r={28} className={s.hit} />
    </g>
  );
}

interface DialFaceProps {
  c: ClockCopy;
  tool: number;
  dom: number;
  onRun: (k: number, e: MouseEvent<Element> | KeyboardEvent<Element>, el: Element) => void;
  onTool: (k: number) => void;
}

/** The turning 24-hour face: ticks, numerals, your day's bands, and the agent's ring of runs. */
export function DialFace({ c, tool, dom, onRun, onTool }: DialFaceProps) {
  return (
    <svg viewBox="0 0 600 600" role="group" aria-label={c.dial.aria} overflow="visible">
      <circle cx={C} cy={C} r={296} className={s.glass} />
      <circle cx={C} cy={C} r={296} className={s.rim} />
      <circle cx={C} cy={C} r={154} className={s.hubdisc} />
      <path d={TICKS.a} className={`${s.tk} ${s.tkA}`} aria-hidden="true" />
      <path d={TICKS.b} className={`${s.tk} ${s.tkB}`} aria-hidden="true" />
      <path d={TICKS.c} className={`${s.tk} ${s.tkC}`} aria-hidden="true" />
      <g aria-hidden="true">
        {NUMERALS.map((n) => (
          <text key={n.h} x={n.x} y={n.y} className={`${s.num}${n.major ? ` ${s.numQ}` : ""}`} transform={n.rotate} data-cull-h={n.h} data-cull-r={260} data-cull-pad={15}>
            {n.label}
          </text>
        ))}
      </g>
      <g aria-hidden="true">
        {DAY_BANDS.map((b) => (
          <path key={b.id} d={b.d} className={s.dp} data-part={b.id} />
        ))}
      </g>
      <g aria-hidden="true">
        {DAY_BANDS.map((b) => (
          <text key={b.id} x={b.x} y={b.y} className={s.dpl} transform={b.rotate} data-cull-h={b.hm} data-cull-r={BAND_R} data-cull-pad={38}>
            {c.dial.dayParts[b.id]}
          </text>
        ))}
      </g>
      <circle cx={C} cy={C} r={RUN_R} className={s.runtrack} aria-hidden="true" />
      <path d={MINUTES} className={s.minute} aria-hidden="true" />
      <g aria-hidden="true">
        <path d={SETUP_ARC} className={s.setupArc} />
        {SETUP_DOTS.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={2.8} className={s.setupDot} />
        ))}
      </g>
      <g className={s.beads} data-off={dom === 1 || dom === 3 ? "" : undefined} data-k="runBeads">
        {c.runs.items.map((r, k) => (
          <Bead
            key={k}
            h={RUN_HOURS[k]}
            label={RUN_TIMES[k]}
            color={RUN_COLORS[k]}
            aria={fill(c.runs.aria, { time: RUN_TIMES[k], title: r.title })}
            onOpen={(e, el) => onRun(k, e, el)}
          />
        ))}
      </g>
      <g className={s.beads} data-off={dom !== 1 ? "" : undefined} data-k="toolBeads">
        {TOOLS.map((T, k) => (
          <Bead
            key={T.id}
            h={T.hour}
            label={T.time}
            tool
            on={tool === k}
            color={`var(--c-${T.id}-a)`}
            mark={TOOL_PATHS[T.id]}
            aria={fill(c.tools.beadAria, { tool: c.tools.items[T.id].name, time: T.time })}
            onOpen={() => onTool(k)}
          />
        ))}
      </g>
    </svg>
  );
}

import type { ReactNode } from "react";
import { MOMENT_TIMES, NODES, RUN_COLORS, RUN_TIMES, STEP_TIMES, TOOLS, TOOL_WASH } from "./data";
import { LensArt } from "./Lens";
import { fill, type ClockCopy } from "./copy";
import s from "./clock.module.css";

/** One item opened into its own scene. */
export interface CardData {
  kicker: string;
  title: string;
  body: string[];
  /** A line Athena says, shown as a quote after the body. */
  quote?: string;
  note: string;
  art: ReactNode;
  /** The scene's wash colour (never purple: owner ruling). */
  wash: string;
}

function TimeArt({ time, color }: { time: string; color: string }) {
  return (
    <svg viewBox="0 0 200 200">
      <circle cx={100} cy={100} r={92} fill="var(--lens-bg)" stroke={color} strokeWidth={3} />
      <circle cx={100} cy={100} r={78} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="2 7" strokeLinecap="round" />
      <circle cx={100} cy={22} r={9} fill={color} />
      <text x={100} y={112} textAnchor="middle" style={{ font: "700 46px var(--mono)", fill: "var(--foreground)" }}>
        {time}
      </text>
    </svg>
  );
}

/** Builders for each kind of card, from the page's copy. */
export function cardsFor(c: ClockCopy) {
  return {
    run(k: number): CardData {
      const r = c.runs.items[k];
      const color = RUN_COLORS[k];
      return {
        kicker: fill(c.runs.kicker, { time: RUN_TIMES[k], trigger: r.trigger }),
        title: r.title,
        body: r.body,
        note: c.card.note,
        art: <TimeArt time={RUN_TIMES[k]} color={color} />,
        wash: k === 2 ? "var(--brand-cyan)" : color,
      };
    },
    job(ti: number, k: number): CardData {
      const T = TOOLS[ti];
      const item = c.tools.items[T.id];
      return {
        kicker: fill(c.card.jobKicker, { tool: item.name, time: T.time }),
        title: item.jobs[k].title,
        body: [item.jobs[k].body, fill(c.card.jobExtra, { tool: item.name })],
        note: c.card.note,
        art: (
          <svg viewBox="0 0 120 120">
            <LensArt tool={T.id} />
          </svg>
        ),
        wash: TOOL_WASH[T.id],
      };
    },
    moment(i: number): CardData {
      const m = c.athena.moments[i];
      return {
        kicker: fill(c.athena.momTime, { time: MOMENT_TIMES[i] }),
        title: m.name,
        body: [m.body],
        quote: m.line,
        note: c.card.momentNote,
        art: (
          <div className={s.athenaCard}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the same local still as the moon disc */}
            <img src="/athena/athena_baseline_640.webp" alt={c.athena.imgAlt} width={320} height={320} />
          </div>
        ),
        wash: "var(--brand-cyan)",
      };
    },
    step(i: number): CardData {
      const st = c.hero.steps[i];
      return {
        kicker: fill(c.card.stepKicker, { time: STEP_TIMES[i] }),
        title: st.name,
        body: st.body,
        note: c.card.note,
        art: <TimeArt time={STEP_TIMES[i]} color="var(--brand-cyan)" />,
        wash: "var(--brand-cyan)",
      };
    },
    node(i: number): CardData {
      const n = c.price.nodes[i];
      return {
        kicker: fill(c.card.nodeKicker, { n: i + 1 }),
        title: n.name,
        body: n.body,
        note: c.card.nodeNote,
        art: (
          <svg viewBox="-40 -40 80 80" style={{ overflow: "visible" }}>
            <circle r={36} fill="var(--lens-bg)" stroke="var(--brand-emerald)" strokeWidth={2.5} />
            <path d={NODES[i].art} transform="scale(1.55)" fill="none" stroke="var(--foreground)" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        wash: "var(--brand-emerald)",
      };
    },
    persona(): CardData {
      const p = c.card.persona;
      return {
        kicker: p.kicker,
        title: p.title,
        body: p.body,
        note: c.card.note,
        art: (
          <svg viewBox="0 0 64 64" style={{ overflow: "visible" }}>
            <use href="#m2-emblem" />
          </svg>
        ),
        wash: "var(--brand-cyan)",
      };
    },
  };
}

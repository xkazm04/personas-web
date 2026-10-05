"use client";

import { Fragment, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { CYCLE_S, LATTICE_PATH, SCENARIOS, STEP_S, TWINKLES, VB_H, VB_W, cellCenter, hexPoints, pct, type Scenario } from "./hive-geometry";
import s from "./hive.module.css";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const delay = (sec: number) => `${(sec % CYCLE_S).toFixed(2)}s`;

function chain(sc: Scenario) {
  const pts = sc.cells.map(cellCenter);
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { pts, len: Math.ceil(len) };
}

/**
 * The honeycomb floor: one static lattice path, the three teams' cells and
 * hand-off links on an overlay, and HTML that stands up out of the plane -
 * the falling event, its ripple, the finished work rising as a light pillar.
 * Purely CSS-driven (hive.module.css), so markup never depends on motion.
 */
export default function HiveFloor() {
  const { t } = useTranslation();
  const copy = t.landingSections.hero;
  return (
    <div className={s.plane}>
      <svg className={`${s.svg} ${s.lattice}`} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={LATTICE_PATH} />
        {TWINKLES.map((c, i) => {
          const [x, y] = cellCenter(c);
          return <polygon key={i} className={s.twinkle} points={hexPoints(x, y, 31)} style={{ animationDelay: `${(i * 1.7) % 7}s` }} />;
        })}
      </svg>
      <div className={s.glow} aria-hidden="true" />
      <div className={s.sweepTrack} aria-hidden="true">
        <div className={s.sweep} />
      </div>
      <svg className={s.svg} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" aria-hidden="true">
        {SCENARIOS.map((sc) => {
          const { pts, len } = chain(sc);
          const start = sc.offset + 0.72;
          return (
            <g key={sc.copy} style={{ "--hue": sc.hue } as Vars}>
              {pts.map(([x, y], k) => (
                <Fragment key={k}>
                  <polygon className={s.halo} points={hexPoints(x, y, 52)} style={{ animationDelay: delay(start + k * STEP_S) }} />
                  <polygon className={s.cell} points={hexPoints(x, y, 31)} style={{ animationDelay: delay(start + k * STEP_S) }} />
                </Fragment>
              ))}
              <polyline
                className={s.link}
                points={pts.map((p) => p.join(",")).join(" ")}
                style={{ "--len": len, animationDelay: delay(start) } as Vars}
              />
            </g>
          );
        })}
      </svg>
      {SCENARIOS.map((sc) => {
        const { pts } = chain(sc);
        const first = pct(pts[0]);
        const last = pct(pts[pts.length - 1]);
        const rise = delay(sc.offset + 0.72 + (pts.length - 1) * STEP_S + 0.3);
        const hue = { "--hue": sc.hue } as Vars;
        return (
          <Fragment key={sc.copy}>
            <span aria-hidden="true" className={s.pool} style={{ ...hue, ...pct(pts[2]), animationDelay: delay(sc.offset + 0.72) }} />
            <span aria-hidden="true" className={s.ripple} style={{ ...hue, ...first, animationDelay: delay(sc.offset) }} />
            <div className={s.stand} style={{ ...hue, ...first }} aria-hidden="true">
              <span className={s.drop} style={{ animationDelay: delay(sc.offset) }} />
              <span className={`${s.chip} ${s.chipEvent}`} style={{ animationDelay: delay(sc.offset) }}>
                {copy.events[sc.copy]}
              </span>
            </div>
            <div className={s.stand} style={{ ...hue, ...last }} aria-hidden="true">
              <span className={s.beam} style={{ animationDelay: rise }} />
              <span className={`${s.chip} ${s.chipDone}`} style={{ animationDelay: rise }}>
                <Check className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
                {copy.done[sc.copy]}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

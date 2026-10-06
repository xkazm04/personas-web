import GradientText from "@/components/GradientText";
import { FACE } from "./art";
import { STEP_TIMES } from "./data";
import { fill, type ClockCopy } from "./copy";
import type { Opener } from "./DialFace";
import s from "./clock.module.css";

/** The hub's small clock: it reads 9:00 and its minute hand walks the three setup beads. */
function HeroFace({ step }: { step: number }) {
  return (
    <svg className={s.face} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <circle cx={100} cy={100} r={94} className={s.fr} />
      {FACE.ticks.map((t, i) => (
        <line key={i} {...t} className={s.ft} />
      ))}
      {FACE.nums.map((n) => (
        <text key={n.label} x={n.x} y={n.y} className={s.fn}>
          {n.label}
        </text>
      ))}
      <path d={FACE.arc} className={s.arc} />
      {FACE.beads.map((b, n) => (
        <circle key={n} cx={b.cx} cy={b.cy} r={7.5} className={s.fb} data-on={n === step ? "" : undefined} />
      ))}
      <line x1={100} y1={100} x2={70} y2={100} strokeWidth={7} className={s.hand} />
      <g className={s.faceMin} style={{ transform: `rotate(${step * 30}deg)` }}>
        <line x1={100} y1={100} x2={100} y2={44} strokeWidth={4.5} className={s.hand} />
      </g>
      <circle cx={100} cy={100} r={7} fill="var(--brand-cyan)" />
    </svg>
  );
}

interface HeroProps {
  c: ClockCopy;
  step: number;
  onStep: (n: number, ...a: Parameters<Opener>) => void;
}

/** Chapter 1, 09:00: "Say it once. It works all day." */
export function HeroChapter({ c, step, onStep }: HeroProps) {
  const [l1, l2, l3] = c.hero.lines;
  return (
    <section className={`${s.ch} ${s.hero}`} data-k="ch0" data-on="" style={{ opacity: 1 }} aria-label={c.hero.label}>
      <div className={s.t}>
        <h1 className={s.hl} data-role="headline">
          <span className={s.ln}>{l1}</span>
          <span className={s.ln}>{l2}</span>
          <span className={s.ln}>
            <GradientText>{l3}</GradientText>
          </span>
        </h1>
      </div>
      <div className={`${s.h} ${s.h0}`}>
        <HeroFace step={step} />
        <div className={`${s.hubCap} ${s.swap}`} key={step}>
          <b>{STEP_TIMES[step]}</b> <span>{c.hero.steps[step].name}</span>
        </div>
      </div>
      <div className={s.b}>
        <p className={s.sub} data-role="hero-sub">{c.hero.sub}</p>
        <div className={s.steps}>
          <span className={s.legend}>{c.hero.legend}</span>
          <div className={s.stepbtns} data-role="steps">
            {c.hero.steps.map((st, n) => (
              <button
                key={n}
                type="button"
                className={s.stepb}
                data-on={n === step ? "" : undefined}
                aria-label={fill(c.hero.stepAria, { n: n + 1, name: st.name })}
                onClick={(e) => onStep(n, e, e.currentTarget)}
              >
                <b>{n + 1}</b>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

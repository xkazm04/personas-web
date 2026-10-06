import GradientText from "@/components/GradientText";
import { MOMENT_TIMES } from "./data";
import { fill, type ClockCopy } from "./copy";
import type { Opener } from "./DialFace";
import s from "./clock.module.css";

interface AthenaProps {
  c: ClockCopy;
  mom: number;
  onMoment: (i: number, ...a: Parameters<Opener>) => void;
}

/** Chapter 3, 22:00-07:30: while you sleep, Athena (the moon over the dial) keeps watch. */
export function AthenaChapter({ c, mom, onMoment }: AthenaProps) {
  const m = c.athena.moments[mom];
  return (
    <section className={s.ch} data-k="ch2" inert aria-label={c.athena.label}>
      <div className={s.t}>
        <h2 className={s.hl}>
          <span className={s.ln}>{c.athena.lines[0]}</span>
          <span className={s.ln}>
            <GradientText>{c.athena.lines[1]}</GradientText>
          </span>
        </h2>
      </div>
      <div className={`${s.h} ${s.h2}`}>
        <div className={s.mtime}>{fill(c.athena.momTime, { time: MOMENT_TIMES[mom] })}</div>
        <div className={s.mname}>
          <span className={s.swap} key={mom}>
            {m.name}
          </span>
        </div>
      </div>
      <div className={s.b}>
        <p className={s.sub}>{c.athena.sub}</p>
        <div className={s.moms} role="group" aria-label={c.athena.momsAria}>
          {c.athena.moments.map((mo, i) => (
            <button
              key={i}
              type="button"
              className={s.mom}
              data-on={i === mom ? "" : undefined}
              aria-label={fill(c.athena.momAria, { time: MOMENT_TIMES[i], name: mo.name })}
              onClick={(e) => onMoment(i, e, e.currentTarget)}
            >
              {MOMENT_TIMES[i]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

interface PriceProps {
  c: ClockCopy;
  price: number;
  onNode: (i: number, ...a: Parameters<Opener>) => void;
}

/** Chapter 4, all day: $0 from Personas; the only bill is your own Claude plan. */
export function PriceChapter({ c, price, onNode }: PriceProps) {
  const lit = (k: number) => price === 3 || k === Math.min(price, 2);
  return (
    <section className={s.ch} data-k="ch3" inert aria-label={c.price.label}>
      <div className={s.t}>
        <h2 className={s.hl}>
          <span className={s.ln}>{c.price.lines[0]}</span>
          <span className={s.ln}>
            <GradientText>{c.price.lines[1]}</GradientText>
          </span>
        </h2>
      </div>
      <div className={`${s.h} ${s.h3}`}>
        <div className={s.zero}>{c.price.zero}</div>
        <div className={s.beatTxt}>
          <span className={s.swap} key={price}>
            {c.price.beats[price]}
          </span>
        </div>
      </div>
      <div className={s.b}>
        <p className={s.sub}>{c.price.sub}</p>
        <div className={s.nodebtns} role="group" aria-label={c.price.nodesAria}>
          {c.price.nodes.map((n, i) => (
            <button key={i} type="button" className={s.nodeb} data-on={lit(i) ? "" : undefined} onClick={(e) => onNode(i, e, e.currentTarget)}>
              <b>{n.name}</b>
              <small>{n.short}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

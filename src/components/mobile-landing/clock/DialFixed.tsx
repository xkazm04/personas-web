import { BAND_R, PRICE_ART } from "./art";
import { C, f1 } from "./geometry";
import { fill, type ClockCopy } from "./copy";
import type { Opener } from "./DialFace";
import s from "./clock.module.css";

interface DialFixedProps {
  c: ClockCopy;
  dom: number;
  price: number;
  onNode: (i: number, ...a: Parameters<Opener>) => void;
}

/** The parts that do not turn: the needle, and the pricing chapter's band, bill and nodes. */
export function DialFixed({ c, dom, price, onNode }: DialFixedProps) {
  const lit = (k: number) => price === 3 || k === Math.min(price, 2);
  return (
    <svg className={s.dialFix} viewBox="0 0 600 600" overflow="visible" role="group" aria-label={c.dial.fixedAria}>
      <g aria-hidden="true">
        <path d="M300 22V150" className={s.needle} />
        <path d="M286 -10L314 -10L300 16Z" className={s.needleTip} />
        <circle cx={300} cy={182} r={6} className={s.needleDot} />
      </g>
      <g className={s.fixedPrice}>
        <circle cx={C} cy={C} r={BAND_R} className={s.bandGlow} aria-hidden="true" />
        <path d={PRICE_ART.bill} className={s.bill} aria-hidden="true" style={{ opacity: price === 1 || price === 2 ? 1 : 0.55 }} />
        <path d={PRICE_ART.stem} className={s.billStem} aria-hidden="true" />
        <g className={s.billBadge} aria-hidden="true" transform={PRICE_ART.badge}>
          <rect x={-66} y={-15} width={132} height={30} rx={15} />
          <text x={0} y={1} dominantBaseline="central">
            {c.dial.bill}
          </text>
        </g>
        {PRICE_ART.nodes.map((n, i) => {
          const name = c.price.nodes[i].name;
          const lw = Math.round(name.length * 7.9 + 22);
          return (
            <g
              key={i}
              className={s.pnode}
              role="button"
              tabIndex={dom === 3 ? 0 : -1}
              aria-label={fill(c.price.nodeAria, { name })}
              transform={`translate(${f1(n.x)} ${f1(n.y)})`}
              data-on={lit(i) ? "" : undefined}
              onClick={(e) => onNode(i, e, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onNode(i, e, e.currentTarget);
                }
              }}
            >
              <circle r={30} className={s.halo} />
              <circle r={26} className={s.ring} />
              <path d={n.art} className={s.nodeArt} transform="scale(.95)" />
              <rect x={-lw / 2} y={36} width={lw} height={26} rx={13} className={s.lblbg} />
              <text x={0} y={49.5}>
                {name}
              </text>
              <circle r={31} fill="transparent" />
            </g>
          );
        })}
        <circle r={7} className={s.pulse} cx={0} cy={0} aria-hidden="true" data-k="pulse" />
      </g>
    </svg>
  );
}

import { STAR_LAYERS } from "./art";
import s from "./clock.module.css";

const TWINKLE = [s.tw, `${s.tw} ${s.tw2}`, `${s.tw} ${s.tw3}`];

/** One graded sky behind the whole day; the engine sets each layer's opacity by the hour. */
export function Sky() {
  return (
    <div className={s.sky} aria-hidden="true">
      <div className={`${s.sk} ${s.skNight}`} />
      <div className={`${s.sk} ${s.skDawn}`} data-k="skDawn" />
      <div className={`${s.sk} ${s.skDay}`} data-k="skDay" />
      <div className={`${s.sk} ${s.skDusk}`} data-k="skDusk" />
      <div className={s.stars} data-k="stars">
        {STAR_LAYERS.map((stars, g) => (
          <svg key={g} viewBox="0 0 430 932" preserveAspectRatio="xMidYMid slice" className={TWINKLE[g]}>
            {stars.map((st, i) => (
              <circle key={i} cx={st.cx} cy={st.cy} r={st.r} opacity={st.o} />
            ))}
          </svg>
        ))}
      </div>
      <div className={`${s.orbit} ${s.sun}`} data-k="sun">
        <i />
      </div>
      <div className={`${s.orbit} ${s.moon}`} data-k="moon">
        <i />
      </div>
      <div className={s.scrimTop} />
      <div className={s.grain} />
    </div>
  );
}

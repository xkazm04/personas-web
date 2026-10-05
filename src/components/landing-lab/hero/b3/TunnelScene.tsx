"use client";

import { forwardRef, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { NODE_ANGLES, RING_DATA, STREAKS } from "./tunnel-data";
import s from "./tunnel.module.css";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * The tunnel: a breathing core at the far end, sparks streaming out of it,
 * and rings - teams of agents - flying toward the viewer. Each ring names its
 * job while it approaches and turns to "delivered" as it arrives. CSS only;
 * the per-ring still-frame values ride along as custom properties, so the
 * markup is the same with or without motion.
 */
const TunnelScene = forwardRef<HTMLDivElement>(function TunnelScene(_, ref) {
  const { t } = useTranslation();
  const copy = t.landingLab.heroB.b3;
  return (
    <div ref={ref} role="img" aria-label={copy.aria} className={s.tunnel}>
      <div className={s.core} aria-hidden="true" />
      <div className={s.space} aria-hidden="true">
        {STREAKS.map((st, i) => (
          <div
            key={`s${i}`}
            className={s.streak}
            style={{ "--a": st.a, "--r": st.r, "--dur": st.dur, "--hue": st.hue, animationDelay: st.delay } as Vars}
          >
            <span className={s.streakLine} style={{ animationDelay: st.delay }} />
          </div>
        ))}
        {RING_DATA.map((ring) => (
          <div
            key={ring.team}
            className={s.ring}
            style={{
              "--hue": ring.hue,
              "--z0": ring.z0,
              "--o0": ring.o0,
              "--team-o": ring.teamO,
              "--done-o": ring.doneO,
              "--spin": ring.spin,
              animationDelay: ring.delay,
            } as Vars}
          >
            <div className={s.spin}>
              <span className={s.arc} />
              {NODE_ANGLES.map((deg, k) => (
                <span
                  key={k}
                  className={`${s.node}${k % 3 === 0 ? ` ${s.lead}` : ""}`}
                  style={{ transform: `rotate(${deg}deg) translateY(-75svh)` }}
                />
              ))}
            </div>
            <span className={`${s.chip} ${s.chipTeam}`} style={{ animationDelay: ring.delay }}>
              {copy.teams[ring.team % copy.teams.length]}
            </span>
            <span className={`${s.chip} ${s.chipDone}`} style={{ animationDelay: ring.delay }}>
              <Check className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
              {copy.delivered}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default TunnelScene;

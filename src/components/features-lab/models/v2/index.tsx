"use client";

import { useRef } from "react";
import { Lock } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { ArtBox, Intro, StylisedTag, frame } from "../shared/Frame";
import { CLAUDE, LOCAL, mix, useLoop } from "../shared/motion";
import Sky from "./Sky";
import Tether from "./Tether";
import Home from "./Home";
import { BUTTONS, GROUND, H, NAMES, W } from "./geometry";
import { useEngine } from "./useEngine";

/**
 * Models lab V2 "Tether and dome": your machine on the ground, Claude's engines
 * in the sky. A tether of light reaches the chosen engine and carries work out
 * and answers back. Choose Ollama and the tether pulls home, a dome closes over
 * the machine and the work circles inside it. The choice cycles by itself while
 * in view until the visitor picks (real buttons); pulses and the cycle stop
 * off-screen, in a hidden tab and under reduced motion (rests on Sonnet).
 */
export default function ModelsLabV2() {
  const c = useTranslation().t.featuresLab.models;
  const ref = useRef<HTMLDivElement>(null);
  const still = useStillMotion();
  const { sel, pick, tx, ty, reach, dome } = useEngine(ref);
  const flow = useLoop(ref, 3.4, 0.2);
  const { place, fs } = frame(W, H);
  const local = sel === "ollama";

  return (
    <SectionWrapper fit="fill" id="multi-provider">
      <Intro lede={c.v2.lede} />
      <ArtBox w={W} h={H} boxRef={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" role="img" aria-label={c.v2.artLabel} fill="none">
          <Sky sel={sel} dome={dome} still={still} />
          <Tether tx={tx} ty={ty} reach={reach} flow={flow} />
          <Home dome={dome} flow={flow} local={local} />
        </svg>

        <p
          className="text-center font-semibold transition-colors duration-500"
          style={{ ...place(200, GROUND + 52, 800), ...fs(24, 16), color: local ? LOCAL : CLAUDE }}
        >
          {c.v2.captions[sel]}
        </p>

        <div role="group" aria-label={c.v2.choose} className="flex items-center justify-center gap-[1.2cqw]" style={{ ...place(200, GROUND + 104, 800) }}>
          {BUTTONS.map((e) => {
            const on = sel === e;
            const col = e === "ollama" ? LOCAL : CLAUDE;
            return (
              <button
                key={e}
                type="button"
                aria-pressed={on}
                onClick={() => pick(e)}
                className={`flex items-center gap-2 rounded-full border px-[1.6cqw] py-[0.6cqw] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan ${e === "ollama" ? "ml-[1.6cqw]" : ""} ${on ? "text-foreground" : "border-glass text-foreground/75 hover:border-glass-hover hover:text-foreground"}`}
                style={{ ...fs(18, 14), ...(on ? { borderColor: col, background: mix(col, 18) } : {}) }}
              >
                {e === "ollama" && <Lock className="h-[1em] w-[1em]" style={{ color: LOCAL }} aria-hidden />}
                {NAMES[e]}
              </button>
            );
          })}
        </div>
        <StylisedTag className="bottom-[1%] right-[2%]" />
      </ArtBox>
    </SectionWrapper>
  );
}

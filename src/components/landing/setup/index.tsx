"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import LnIcon from "../shared/LnIcon";
import LnLed from "../shared/LnLed";
import LnSectionHead from "../shared/LnSectionHead";
import { useTyper } from "../shared/useTyper";
import { SETUP_ICONS } from "./data";
import "./setup.css";

/** Five-step onboarding: pressing a step lights it and types out what it involves. */
export default function LandingSetup() {
  const { t } = useTranslation();
  const s = t.landingNext.setup;
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const { shown, type } = useTyper(80);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const cur = s.steps[step];
  // Until the visitor presses a key the full text is rendered (same as the server).
  const text = touched ? shown : cur.text;
  const count = s.stepCount.replace("{n}", String(step + 1)).replace("{total}", String(s.steps.length));

  const pick = (i: number) => {
    setTouched(true);
    setStep(i);
    void type(s.steps[i].text);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = s.steps.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i + n - 1) % n : -1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
  };

  return (
    <section id="get-started" className="ln-sec" aria-labelledby="get-started-h">
      <div className="ln-wrap">
        <LnSectionHead kicker={s.kicker} headingId="get-started-h" heading={s.heading} accent={s.accent} />
        <div className="ln-setup-panel">
          <div className="ln-lcd ln-setup-lcd">
            <div className="ln-lcd-inner">
              <div aria-live="polite" aria-atomic="true" className="ln-sr">
                {count}: {cur.name}. {cur.text}
              </div>
              <p className="ln-su-no" aria-hidden="true">{count}</p>
              <p className="ln-su-step ln-lcd-glow" aria-hidden="true">{cur.name.toUpperCase()}</p>
              <p className="ln-su-text" aria-hidden="true">{text}</p>
            </div>
            <LnIcon id={SETUP_ICONS[step]} className="ln-su-art" />
          </div>
          <ul className="ln-su-keys" aria-label={s.keysLabel}>
            {s.steps.map((st, i) => (
              <li key={st.name}>
                <button
                  type="button"
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  className="ln-bigkey"
                  aria-pressed={i === step}
                  onClick={() => pick(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <LnLed state={i <= step ? "on" : "off"} className={i <= step ? "ln-on" : undefined} />
                  <span className="ln-n">{`0${i + 1}`}</span>
                  <span className="ln-t">{st.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ln-su-foot">
            <span className="ln-caption">{s.hint}</span>
            <span className="ln-caption">{s.note}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

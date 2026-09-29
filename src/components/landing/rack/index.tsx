"use client";

import "./rack.css";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import LnSectionHead from "../shared/LnSectionHead";
import Cartridge from "./Cartridge";
import PersonaScene from "./PersonaScene";
import { PERSONA_META, colorVar, fill, pad2 } from "./data";

/** The rack of six example personas; opening one shows the modal persona scene. */
export default function LandingRack() {
  const { t } = useTranslation();
  const r = t.landingNext.rack;
  const [stageState, setStageState] = useState({ i: -1, tick: 0 });
  const [hot, setHot] = useState(-1);
  const shown = stageState.i;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const lastOpener = useRef(0);

  // Restore focus to the item that opened (or was last stepped to in) the scene.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (openIdx === null && wasOpen.current) buttons.current[lastOpener.current]?.focus({ preventScroll: true });
    wasOpen.current = openIdx !== null;
  }, [openIdx]);

  const show = useCallback((i: number) => {
    setHot(i);
    setStageState((s) => (s.i === i ? s : { i, tick: s.tick + 1 }));
  }, []);
  const step = useCallback((i: number) => {
    lastOpener.current = i;
    setOpenIdx(i);
    show(i);
  }, [show]);

  const p = shown >= 0 ? r.personas[shown] : null;
  const stageStyle = { "--ln-pc": p ? colorVar(PERSONA_META[shown].color) : "var(--ln-signal)" } as CSSProperties;

  return (
    <section id="personas" data-tour-diagram="tools" className="ln-sec ln-rack-sec" aria-labelledby="personas-h">
      <div className="ln-wrap">
        <div className="ln-rack-head">
          <LnSectionHead kicker={r.kicker} headingId="personas-h" heading={r.heading} accent={r.headingAccent} />
          <p className="ln-lead">{r.lede}</p>
        </div>
        <div key={stageState.tick} className={`ln-stage${p ? " ln-swap" : ""}`} style={stageStyle}>
          <p className="ln-stage-k">
            <i />
            <span>
              {p ? fill(r.stageCount, { n: pad2(shown + 1), total: r.personas.length, trigger: p.triggerKind.toLowerCase() }) : r.stageKicker}
            </span>
          </p>
          <p className="ln-stage-name">{p ? p.name : r.stageName}</p>
          <p className="ln-stage-hand">{p ? `“${p.label}”` : r.stageHand}</p>
          <p className="ln-stage-hint">{r.stageHint}</p>
        </div>
        <div className="ln-rack" onPointerLeave={() => {
          if (!buttons.current.includes(document.activeElement as HTMLButtonElement)) setHot(-1);
        }}>
          <div className="ln-rack-back" />
          <ul className="ln-rack-row" aria-label={r.listLabel}>
            {r.personas.map((persona, i) => (
              <li key={PERSONA_META[i].id}>
                <button
                  ref={(el) => { buttons.current[i] = el; }}
                  type="button"
                  className={`ln-cbtn${hot === i ? " ln-sel" : ""}${openIdx === i ? " ln-gone" : ""}`}
                  aria-label={`${persona.name}: ${persona.label}. ${r.openHint}`}
                  aria-haspopup="dialog"
                  onPointerEnter={() => show(i)}
                  onFocus={() => show(i)}
                  onBlur={() => setHot(-1)}
                  onClick={() => step(i)}
                >
                  <Cartridge
                    name={persona.name}
                    label={persona.label}
                    glyph={PERSONA_META[i].glyph}
                    color={PERSONA_META[i].color}
                    index={pad2(i + 1)}
                  />
                </button>
              </li>
            ))}
          </ul>
          <div className="ln-rack-lip">
            <span className="ln-silk">{r.lipLeft}</span>
            <span className="ln-silk">{r.lipRight}</span>
          </div>
        </div>
        <div className="ln-rack-note">
          <span className="ln-caption">{r.noteLeft}</span>
          <span className="ln-caption">{r.noteRight}</span>
        </div>
      </div>
      {openIdx !== null ? (
        <PersonaScene
          index={openIdx}
          getOpenerCart={(i) => buttons.current[i]?.querySelector<HTMLElement>(".ln-cart") ?? null}
          onIndex={step}
          onClose={() => setOpenIdx(null)}
        />
      ) : null}
    </section>
  );
}

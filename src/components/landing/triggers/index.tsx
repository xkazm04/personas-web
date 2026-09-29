"use client";

import { useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import LnLed from "../shared/LnLed";
import LnSectionHead from "../shared/LnSectionHead";
import { useAmbientLive } from "../shared/useAmbientLive";
import TriggerArt from "./TriggerArt";
import "./triggers.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Ten trigger types as controls; pressing one shows the wake signal it sends. */
export default function LandingTriggers() {
  const { t } = useTranslation();
  const c = t.landingNext.triggers;
  const still = useStillMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const live = useAmbientLive(panelRef);
  const total = c.items.length;

  const [shown, setShown] = useState<number | null>(null);
  const [armed, setArmed] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [fired, setFired] = useState(-1);
  const [angle, setAngle] = useState(0);
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [announce, setAnnounce] = useState("");

  const press = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    // Drop and re-add the fire class across a reflow so the one-shot animation restarts.
    flushSync(() => setFired(-1));
    void e.currentTarget.offsetWidth;
    setFired(i);
    setShown(i);
    setArmed(i);
    setSent(true);
    if (i === 2) setAngle((a) => a + 45);
    if (i === 3 || i === 4 || i === 5) setFlags((f) => ({ ...f, [i]: !f[i] }));
    setAnnounce(c.announce.replace("{name}", c.items[i].name));
  };
  const show = (i: number) => {
    setShown(i);
    setSent(false);
  };

  const state = sent
    ? c.sent
    : shown === null
      ? c.stateIdle
      : c.stateOf.replace("{n}", pad(shown + 1)).replace("{total}", String(total));

  return (
    <section id="triggers" className="ln-sec" aria-labelledby="triggers-h">
      <div className="ln-wrap">
        <LnSectionHead kicker={c.kicker} headingId="triggers-h" heading={c.heading} accent={c.accent} />
        <div ref={panelRef} className={`ln-tp${live ? " ln-live" : ""}`}>
          <div className="ln-lcd ln-tp-lcd">
            <div className="ln-lcd-inner">
              <span className="ln-tp-state">{state}</span>
              <p className="ln-tp-name ln-lcd-glow ln-dots">{shown === null ? c.nameIdle : c.items[shown].name}</p>
              <p className="ln-tp-desc" aria-live="polite">
                {shown === null ? c.hint : c.items[shown].desc}
              </p>
            </div>
          </div>
          <ul className="ln-ctls" aria-label={c.listLabel}>
            {c.items.map((item, i) => {
              const firing = !still && fired === i;
              const toggle = i === 3 || i === 4 || i === 5;
              const cls = ["ln-ctl", firing && "ln-fire", i === 3 && flags[3] && "ln-plugged", (i === 4 || i === 5) && flags[i] && "ln-on-state"];
              return (
                <li key={item.name}>
                  <button
                    type="button"
                    className={cls.filter(Boolean).join(" ")}
                    aria-label={c.ariaLabel.replace("{name}", item.name).replace("{desc}", item.desc)}
                    aria-pressed={toggle ? !!flags[i] : undefined}
                    onPointerEnter={() => show(i)}
                    onFocus={() => show(i)}
                    onClick={(e) => press(i, e)}
                  >
                    <LnLed state={armed === i ? "on" : "off"} />
                    <span className="ln-art" aria-hidden="true">
                      <TriggerArt index={i} angle={angle} labels={{ run: c.artRun, idle: c.artIdle, changed: c.artChanged }} />
                    </span>
                    <span className="ln-nm">
                      <i>{pad(i + 1)}</i>
                      {item.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="ln-sr" aria-live="polite">
            {announce}
          </p>
          <div className="ln-tp-foot">
            <span className="ln-caption">{c.captionA}</span>
            <span className="ln-caption">{c.captionB}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

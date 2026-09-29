"use client";

import type { CSSProperties } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import LnIcon from "../shared/LnIcon";
import LnLed from "../shared/LnLed";
import Cartridge from "../rack/Cartridge";
import { PERSONA_META, fill, pad2 } from "../rack/data";
import { useHeroDeck } from "./useHeroDeck";

const at = (em: number) => ({ left: `${em}em` }) as CSSProperties;

/**
 * The live hero art: a hardware-shaped stage with an example persona loaded,
 * a screen that types a plain-language agent request, and two working
 * controls (play/pause, next example). Stylised illustration, not product UI.
 */
export default function HeroDeck() {
  const { t } = useTranslation();
  const h = t.landingNext.hero;
  const personas = t.landingNext.rack.personas;
  const { figRef, bayRef, ...deck } = useHeroDeck(personas.map((p) => p.request));
  const p = personas[deck.index];
  const meta = PERSONA_META[deck.index];
  const announce = fill(h.announce, { name: p.name, request: p.request });

  return (
    <figure ref={figRef} className={`ln-hero-deck${deck.live ? " ln-live" : ""}`}>
      <div className="ln-rig" role="img" aria-label={h.artLabel}>
        <div className="ln-rig-shadow" />
        <div className="ln-rig-slot" />
        <div className="ln-rig-bay" aria-hidden="true">
          <div ref={bayRef} className={deck.playing ? "ln-running" : undefined}>
            <Cartridge
              key={meta.id}
              name={p.name}
              label={p.label}
              glyph={meta.glyph}
              color={meta.color}
              index={pad2(deck.index + 1)}
            />
          </div>
        </div>
        <div className="ln-deck ln-lit">
          <i className="ln-screw ln-s1" />
          <i className="ln-screw ln-s2" />
          <i className="ln-screw ln-s3" />
          <i className="ln-screw ln-s4" />
          <div className="ln-deck-silk ln-hd-brand" aria-hidden="true">
            <LnIcon id="mark" />
            <b>{h.brand}</b>
          </div>
          <div className="ln-hd-pwr" aria-hidden="true">
            <span className="ln-deck-silk" style={{ position: "static" }}><span className="ln-fl">{h.ready}</span></span>
            <LnLed state="on" />
          </div>
          <div className="ln-grille ln-hd-grille" aria-hidden="true" />
          <div className="ln-lcd ln-hd-lcd">
            <p className="ln-sr" aria-live="polite">{announce}</p>
            <div className="ln-lcd-inner" aria-hidden="true">
              <div className="ln-lcd-status">
                <span>{h.statusExample}</span>
                <span>{p.name}</span>
                <span className={`ln-run${deck.playing ? " ln-on" : ""}`}>
                  {"● "}
                  {deck.playing ? h.statusRunning : h.statusPaused}
                </span>
              </div>
              <p className="ln-hd-big ln-lcd-glow">{h.display}</p>
              <p className="ln-hd-req">
                <span>{deck.request}</span>
                <i className="ln-cursor" />
              </p>
            </div>
          </div>
          <div className="ln-deck-silk ln-hd-legend" style={at(4)} aria-hidden="true"><span className="ln-fl">{h.promises}</span></div>
          <div className="ln-hd-pks" aria-hidden="true">
            <div className="ln-hd-pk" style={at(4)}><span>{t.hero.mode2}</span></div>
            <div className="ln-hd-pk" style={at(13)}><span>{t.hero.mode3}</span></div>
            <div className="ln-hd-pk" style={at(22)}><span>{t.hero.mode5}</span></div>
          </div>
          <div className="ln-hd-transport">
            <span className="ln-deck-silk" aria-hidden="true"><span className="ln-fl">{h.controls}</span></span>
            <span className="ln-mini-key" style={at(0)} aria-hidden="true"><LnIcon id="i-rew" /></span>
            <button
              type="button"
              className="ln-mini-key ln-o"
              style={at(6.4)}
              aria-pressed={deck.playing}
              aria-label={deck.playing ? h.pause : h.play}
              onClick={deck.togglePlaying}
            >
              <LnIcon id="i-play" />
            </button>
            <span className="ln-mini-key" style={at(12.8)} aria-hidden="true"><LnIcon id="i-stop" /></span>
            <button type="button" className="ln-mini-key" style={at(19.2)} aria-label={h.next} onClick={deck.next}>
              <LnIcon id="i-eject" />
            </button>
          </div>
          <div className="ln-dial-scale ln-hd-dial-scale" aria-hidden="true" />
          <div className="ln-dial ln-hd-dial" aria-hidden="true"><i /></div>
          <div className="ln-deck-silk ln-hd-foot" aria-hidden="true"><span className="ln-fl">{h.foot}</span></div>
        </div>
      </div>
      <figcaption className="ln-caption">{h.caption}</figcaption>
    </figure>
  );
}

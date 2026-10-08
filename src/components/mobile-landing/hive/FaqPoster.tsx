"use client";

import type { Translations } from "@/i18n/en";
import HiveSheet from "./HiveSheet";
import { FAQ_GLYPHS, FAQ_TONES, hexPts, mod } from "./data";
import { Glyph } from "./Glyphs";
import { fill, type MobileLandingCopy } from "./useHiveCopy";

const TILE_HEX = hexPts(33, 29, 28);
const SHEET_HEX = hexPts(37, 33, 32);

interface PosterProps {
  f: MobileLandingCopy["faq"];
  tag: string;
  on: boolean;
  onOpen: (i: number) => void;
}

/** Poster 5: four question tiles; each opens its answer as a full-height layer. */
export default function FaqPoster({ f, tag, on, onOpen }: PosterProps) {
  return (
    <section className={`poster p5${on ? " on" : ""}`} id="s5" data-poster="" aria-labelledby="hm-h5">
      <div className="bg" aria-hidden="true" />
      <div className="copy">
        <h2 id="hm-h5" className="disp" data-role="m-faq-title">{f.title}</h2>
      </div>
      <ul className="faq">
        {f.tiles.map((label, i) => (
          <li key={label}>
            <button className="qtile" type="button" aria-haspopup="dialog" data-role="m-qtile" onClick={() => onOpen(i)}>
              <span className="qglyph" aria-hidden="true">
                <svg className="hexbg" viewBox="0 0 66 58">
                  <polygon points={TILE_HEX} />
                </svg>
                <svg className="g">
                  <use href={`#hm-${FAQ_GLYPHS[i]}`} />
                </svg>
              </span>
              <span className="qtext" data-role="m-qtext">{label}</span>
              <Glyph id="gl-chev-r" size={22} className="qarrow" />
            </button>
          </li>
        ))}
      </ul>
      <p className="tag faq-tag">{tag}</p>
    </section>
  );
}

interface SheetProps {
  index: number | null;
  onStep: (i: number) => void;
  onClose: () => void;
  f: MobileLandingCopy["faq"];
  back: string;
  questions: Translations["faqSection"]["questions"];
  still: boolean;
}

/** The answer layer: the full question and answer, with previous / next through all four. */
export function FaqSheet({ index, onStep, onClose, f, back, questions, still }: SheetProps) {
  const i = mod(index ?? 0, questions.length);
  const tone = FAQ_TONES[i];
  const step = (d: 1 | -1) => onStep(mod(i + d, questions.length));
  return (
    <HiveSheet
      open={index !== null}
      onClose={onClose}
      full
      label={f.sheetLabel}
      labelledBy="hm-sf-title"
      backLabel={back}
      tone={tone}
      onArrow={step}
      still={still}
      barEnd={<span className="sidx">{fill(f.index, { n: i + 1, total: questions.length })}</span>}
      footer={
        <div className="snav">
          <button className="rbtn wide" type="button" onClick={() => step(-1)}>
            <Glyph id="gl-chev-l" size={22} />
            <span>{f.prev}</span>
          </button>
          <button className="rbtn wide" type="button" onClick={() => step(1)}>
            <span>{f.next}</span>
            <Glyph id="gl-chev-r" size={22} />
          </button>
        </div>
      }
    >
      <div className="sbody">
        <div className="anim" key={i}>
          <div className="fq-g" style={{ "--c": tone } as React.CSSProperties}>
            <svg viewBox="0 0 74 66" aria-hidden="true">
              <polygon points={SHEET_HEX} />
            </svg>
            <svg className="g" aria-hidden="true">
              <use href={`#hm-${FAQ_GLYPHS[i]}`} />
            </svg>
          </div>
          <h3 className="fq-title" id="hm-sf-title">{questions[i].q}</h3>
          <p className="fq-a">{questions[i].a}</p>
        </div>
      </div>
    </HiveSheet>
  );
}

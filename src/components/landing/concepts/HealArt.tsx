import type { Translations } from "@/i18n/en";
import FigureLamp, { type LampState } from "./FigureLamp";

type Copy = Translations["landingNext"]["conceptsB"]["heal"];

const SPILL = "M82 146C82 147 84 148 87 148C90 148 90 148 90 148C91 148 92 147 92 146";
const NOTCH = "M184 80l4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4V192H184Z";

/** The SVG art of figure C4: a failed run, the retry, the coaching note. */
export default function HealArt({
  c,
  msg,
  lamp,
  blink,
}: {
  c: Copy;
  msg: string;
  lamp: LampState;
  blink: boolean;
}) {
  return (
    <svg className="ln-ci-svg" viewBox="0 0 320 240" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="ci-h-rcclip"><rect x="170" y="0" width="150" height="193" /></clipPath>
      </defs>
      <rect className="ln-ci-bezel" x="12" y="10" width="266" height="40" rx="8" />
      <rect className="ln-ci-lcd" x="15" y="13" width="260" height="34" rx="5" />
      <text className="ln-ci-lcdt ln-ci-lcdt--dim" x="24" y="27.5">{c.agent}</text>
      <text className="ln-ci-lcdt ln-ci-h-msg" x="24" y="42" style={{ fontSize: 13.5 }}>{msg}</text>
      <rect className="ln-ci-scan" x="15" y="13" width="260" height="34" rx="5" />
      <FigureLamp cx={295} cy={30} r={5.4} state={lamp} blink={blink} />
      <ellipse className="ln-ci-shadow" cx="87" cy="149" rx="82" ry="6" />
      <rect className="ln-ci-lip" x="12" y="61" width="150" height="88" rx="8" />
      <rect className="ln-ci-h-shell" x="12" y="58" width="150" height="88" rx="8" />
      <rect className="ln-ci-sheen" x="12" y="58" width="150" height="88" rx="8" />
      <path className="ln-ci-edge-hl" d="M22 59.3h130" />
      <rect className="ln-ci-paper" x="20" y="64" width="134" height="52" rx="4" />
      <rect className="ln-ci-h-stripe" x="20" y="64" width="134" height="4.5" rx="1.5" />
      <text className="ln-ci-hand" x="28" y="81.5">{c.tag}</text>
      <rect className="ln-ci-win" x="40" y="86" width="94" height="26" rx="13" />
      <circle className="ln-ci-pack" cx="61" cy="99" r="12" />
      <circle className="ln-ci-pack" cx="113" cy="99" r="9.5" />
      <g className="ln-ci-h-hubL">
        <use href="#ci-s-hub" className="ln-ci-reel" x="52" y="90" width="18" height="18" style={{ transformOrigin: "61px 99px" }} />
      </g>
      <use href="#ci-s-hub" className="ln-ci-reel" x="104" y="90" width="18" height="18" style={{ transformOrigin: "113px 99px" }} />
      <path className="ln-ci-glass" d="M78 86h20l-12 26H66z" />
      <path className="ln-ci-h-trap" d="M36 146L45 124H129L138 146Z" />
      {[55, 70, 104, 119].map((x) => <circle key={x} className="ln-ci-hole" cx={x} cy="137" r="2.6" />)}
      <rect className="ln-ci-hole" x="80" y="131" width="14" height="15" rx="1.5" />
      <use href="#ci-s-screw" x="14.5" y="134.5" width="9" height="9" />
      <use href="#ci-s-screw" x="150.5" y="134.5" width="9" height="9" />
      <path className="ln-ci-h-spill ln-ci-h-spill--a" d={SPILL} />
      <path className="ln-ci-h-spill ln-ci-h-spill--b" d={SPILL} />
      <ellipse className="ln-ci-shadow ln-ci-h-penshadow" cx="106" cy="226" rx="48" ry="4.5" />
      <g clipPath="url(#ci-h-rcclip)">
        <g className="ln-ci-h-rc">
          <path className="ln-ci-paper" d={NOTCH} />
          <text className="ln-ci-mono" x="192" y="96">{c.noteHead1}</text>
          <text className="ln-ci-mono" x="192" y="110">{c.noteHead2}</text>
          <path className="ln-ci-h-rule" d="M192 117.5H288" />
          {[c.note1, c.note2, c.note3, c.note4].map((line, i) => (
            <text key={i} className="ln-ci-hand" x="192" y={133 + i * 15}>{line}</text>
          ))}
        </g>
      </g>
      <rect className="ln-ci-lip" x="172" y="189" width="138" height="44" rx="10" />
      <rect className="ln-ci-body" x="172" y="186" width="138" height="44" rx="10" />
      <path className="ln-ci-edge-hl" d="M183 187.4h116" />
      <rect className="ln-ci-slot" x="180" y="190" width="122" height="6" rx="3" />
      <text className="ln-ci-silk" x="241" y="214.5" textAnchor="middle">{c.overseer}</text>
      <use href="#ci-s-screw" x="178" y="215.5" width="8" height="8" />
      <use href="#ci-s-screw" x="296" y="215.5" width="8" height="8" />
      <g className="ln-ci-h-pen">
        <g className="ln-ci-h-penrot">
          <path className="ln-ci-h-graphite" d="M61 99L57.6 90.5H64.4Z" />
          <path className="ln-ci-h-wood" d="M57.6 90.5L54 79H68L64.4 90.5Z" />
          <path className="ln-ci-h-penbody" d="M54 35H68V79Q65.7 82 63.3 79Q61 82 58.7 79Q56.3 82 54 79Z" />
          <rect className="ln-ci-h-penlite" x="54" y="35" width="4.2" height="44" />
          <rect className="ln-ci-h-pendark" x="63.8" y="35" width="4.2" height="44" />
          <rect className="ln-ci-h-ferrule" x="53.4" y="26" width="15.2" height="10" rx="1" />
          <path className="ln-ci-h-ferline" d="M53.4 29.5h15.2M53.4 32.5h15.2" />
          <rect className="ln-ci-h-eraser" x="54" y="17" width="14" height="10" rx="3.5" />
        </g>
      </g>
    </svg>
  );
}

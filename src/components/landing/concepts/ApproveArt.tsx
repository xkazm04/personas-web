import type { Translations } from "@/i18n/en";
import FigureLamp, { type LampState } from "./FigureLamp";

type Copy = Translations["landingNext"]["conceptsB"]["approve"];

const HOUSING =
  "M24 8H296Q310 8 310 22V116Q310 130 296 130H170V27Q170 20 163 20H33Q26 20 26 27V130H24Q10 130 10 116V22Q10 8 24 8Z";

/** The SVG art of figure C6: gate, arriving change, display, key plate. `stage` classes drive the key/open/in phases. */
export default function ApproveArt({
  c,
  stage,
  lcd,
  lamp,
  onPlate,
}: {
  c: Copy;
  /** 0 idle, 1 key turning, 2 gate open, 3 change inside, 4 done. */
  stage: number;
  lcd: [string, string];
  lamp: LampState;
  onPlate: () => void;
}) {
  const cls = [
    "ln-ci-svg",
    stage >= 1 && "ln-as-key",
    stage >= 2 && "ln-as-open",
    stage >= 3 && "ln-as-in",
    stage >= 4 && "ln-as-ok",
  ].filter(Boolean).join(" ");
  return (
    <svg className={cls} viewBox="0 0 320 240" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="ci-a-bayclip"><rect x="26" y="20" width="144" height="111" /></clipPath>
      </defs>
      <rect className="ln-ci-a-bay" x="26" y="20" width="144" height="111" />
      <path className="ln-ci-a-rail" d="M33 26V130M163 26V130" />
      <g clipPath="url(#ci-a-bayclip)">
        <g className="ln-ci-a-shutter">
          <rect className="ln-ci-a-slats" x="26" y="20" width="144" height="100" />
          <rect className="ln-ci-a-hazard" x="26" y="120" width="144" height="11" />
          <rect className="ln-ci-a-handle" x="84" y="110" width="28" height="5" rx="2.5" />
          <text className="ln-ci-silk" x="98" y="70" textAnchor="middle">{c.gate}</text>
        </g>
      </g>
      <g className="ln-ci-a-cart">
        <rect className="ln-ci-lip" x="38" y="140" width="120" height="84" rx="11" />
        <rect className="ln-ci-a-shell" x="38" y="137" width="120" height="84" rx="11" />
        <rect className="ln-ci-sheen" x="38" y="137" width="120" height="84" rx="11" />
        <path className="ln-ci-edge-hl" d="M50 138.4h96" />
        <path className="ln-ci-grip" d="M80 141v4.5M85 141v4.5M90 141v4.5M95 141v4.5M100 141v4.5M105 141v4.5M110 141v4.5M115 141v4.5" />
        <rect className="ln-ci-win" x="52" y="149" width="92" height="21" rx="7" />
        <circle className="ln-ci-pack" cx="72" cy="159.5" r="9" />
        <circle className="ln-ci-pack" cx="124" cy="159.5" r="7.5" />
        <use href="#ci-s-hub" className="ln-ci-reel" x="64.5" y="152" width="15" height="15" style={{ transformOrigin: "72px 159.5px" }} />
        <use href="#ci-s-hub" className="ln-ci-reel" x="116.5" y="152" width="15" height="15" style={{ transformOrigin: "124px 159.5px" }} />
        <rect className="ln-ci-paper" x="45" y="175" width="106" height="40" rx="3.5" />
        <text className="ln-ci-hand" x="52" y="190.5">{c.fix1}</text>
        <text className="ln-ci-hand" x="52" y="206">{c.fix2}</text>
        <use href="#ci-s-screw" x="41" y="140.5" width="8" height="8" />
        <use href="#ci-s-screw" x="147" y="140.5" width="8" height="8" />
      </g>
      <path className="ln-ci-lip" transform="translate(0 3)" d={HOUSING} />
      <path className="ln-ci-body" d={HOUSING} />
      <path className="ln-ci-edge-hl" d="M24 9.4H296" />
      <FigureLamp cx={182} cy={44} r={5.4} state={lamp} blink={lamp === "sig"} />
      <rect className="ln-ci-bezel" x="194" y="20" width="106" height="48" rx="7" />
      <rect className="ln-ci-lcd" x="197" y="23" width="100" height="42" rx="4.5" />
      <text className="ln-ci-lcdt" x="206" y="40" style={{ fontSize: 13.5 }}>{lcd[0]}</text>
      <text className="ln-ci-lcdt" x="206" y="58" style={{ fontSize: 13.5 }}>{lcd[1]}</text>
      <rect className="ln-ci-scan" x="197" y="23" width="100" height="42" rx="4.5" />
      <path className="ln-ci-a-vent" d="M206 86H288M206 96H288M206 106H288" />
      <use href="#ci-s-screw" x="179" y="114" width="9" height="9" />
      <use href="#ci-s-screw" x="295" y="114" width="9" height="9" />
      <g className="ln-ci-a-plate" onClick={onPlate}>
        <rect className="ln-ci-lip" x="184" y="141" width="122" height="93" rx="12" />
        <rect className="ln-ci-body" x="184" y="138" width="122" height="93" rx="12" />
        <path className="ln-ci-edge-hl" d="M196 139.4h98" />
        {[[189, 143], [293, 143], [189, 218], [293, 218]].map(([x, y]) => (
          <use key={`${x}-${y}`} href="#ci-s-screw" x={x} y={y} width="8" height="8" />
        ))}
        <text className="ln-ci-silk ln-ci-silk--ink" x="240" y="157.5" textAnchor="middle">{c.wait}</text>
        <text className="ln-ci-silk ln-ci-silk--ink" x="269" y="190.4">{c.yes}</text>
        <circle className="ln-ci-a-bezel" cx="240" cy="186" r="20" />
        <circle className="ln-ci-a-core" cx="240" cy="186" r="14" />
        <rect className="ln-ci-a-keyway" x="238.2" y="175" width="3.6" height="22" rx="1.5" />
        <circle className="ln-ci-a-hint" cx="240" cy="186" r="23" />
      </g>
      <g className="ln-ci-a-keywrap"><g className="ln-ci-a-key"><g className="ln-ci-a-keyrot">
        <rect className="ln-ci-a-bow" x="234" y="161" width="12" height="50" rx="6" />
        <path className="ln-ci-a-bowhl" d="M237.2 167V201" />
        <circle className="ln-ci-a-dot" cx="240" cy="167" r="2.2" />
        <circle className="ln-ci-hole" cx="240" cy="205" r="2.2" />
        <circle className="ln-ci-a-ring" cx="240" cy="211.5" r="6.5" />
        <g className="ln-ci-a-tag">
          <rect className="ln-ci-paper" x="226" y="214.5" width="28" height="22" rx="3" style={{ filter: "url(#ci-f-drop)" }} />
          <circle className="ln-ci-hole" cx="240" cy="218.5" r="1.6" />
          <text className="ln-ci-hand" x="240" y="232" textAnchor="middle">{c.you}</text>
        </g>
      </g></g></g>
    </svg>
  );
}

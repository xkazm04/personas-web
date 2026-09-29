import type { Translations } from "@/i18n/en";
import FigureLamp, { type LampState } from "./FigureLamp";
import { LEADS, TICKS, knobAngle } from "./triggers-data";

type Copy = Translations["landingNext"]["conceptsB"]["triggers"];
const WIRE = "M160 156C160 198 192 204 226 199";

/** The SVG art of figure C5: dial, tick marks, wire and the woken agent. */
export default function TriggersArt({
  c,
  cur,
  name,
  lamp,
  zap,
  running,
}: {
  c: Copy;
  cur: number;
  name: string;
  lamp: LampState;
  /** Increments per firing; re-keys the pulse so its animation restarts. */
  zap: number;
  running: boolean;
}) {
  const on = (i: number) => (i === cur ? " ln-is-on" : "");
  const cls = ["ln-ci-svg", zap > 0 && "ln-is-zap", running && "ln-is-run"].filter(Boolean).join(" ");
  return (
    <svg className={cls} viewBox="0 0 320 240" aria-hidden="true" focusable="false">
      <text className="ln-ci-silk" x="160" y="22" textAnchor="middle">{c.wakeOn}</text>
      {LEADS.map((d, i) => <path key={i} className={`ln-ci-t-lead${on(i)}`} d={d} />)}
      {TICKS.map((d, i) => <path key={i} className={`ln-ci-t-tick${on(i)}`} d={d} />)}
      <circle className="ln-ci-t-seat" cx="160" cy="94" r="38.5" />
      <g className="ln-ci-t-knobwrap">
        <g className="ln-ci-t-knob" style={{ transform: `rotate(${knobAngle(cur).toFixed(2)}deg)` }}>
          <circle className="ln-ci-t-skirt" cx="160" cy="94" r="35" />
          <circle className="ln-ci-t-knurl" cx="160" cy="94" r="33.4" />
          <circle className="ln-ci-t-top" cx="160" cy="94" r="25" />
          <rect className="ln-ci-t-ptr" x="158" y="61.5" width="4" height="16" rx="2" />
          <circle className="ln-ci-t-dimple" cx="160" cy="94" r="5" />
        </g>
      </g>
      <ellipse className="ln-ci-t-spec" cx="151" cy="82" rx="13" ry="8" transform="rotate(-28 151 82)" />
      <circle className="ln-ci-nut" cx="160" cy="154" r="7.2" />
      <circle className="ln-ci-hole" cx="160" cy="154" r="3.2" />
      <path className="ln-ci-t-wire" d={WIRE} />
      <path key={zap} className="ln-ci-t-pulse" pathLength={100} d={WIRE} />
      <rect className="ln-ci-bezel" x="12" y="170" width="138" height="56" rx="7" />
      <rect className="ln-ci-lcd" x="15" y="173" width="132" height="50" rx="4.5" />
      <text className="ln-ci-lcdt ln-ci-lcdt--dim" x="24" y="190">{c.wokenBy}</text>
      <text className="ln-ci-lcdt ln-ci-t-name" x="24" y="213" style={{ fontSize: 15 }}>{name}</text>
      <rect className="ln-ci-scan" x="15" y="173" width="132" height="50" rx="4.5" />
      <ellipse className="ln-ci-shadow" cx="266" cy="232" rx="46" ry="4.5" />
      <rect className="ln-ci-lip" x="226" y="167" width="80" height="64" rx="9" />
      <rect className="ln-ci-t-shell" x="226" y="164" width="80" height="64" rx="9" />
      <rect className="ln-ci-sheen" x="226" y="164" width="80" height="64" rx="9" />
      <path className="ln-ci-edge-hl" d="M235 165.3h62" />
      <path className="ln-ci-grip" d="M252 167.5v3.5M256 167.5v3.5M260 167.5v3.5M264 167.5v3.5M268 167.5v3.5M272 167.5v3.5M276 167.5v3.5M280 167.5v3.5" />
      <rect className="ln-ci-win" x="234" y="174" width="64" height="22" rx="7" />
      <circle className="ln-ci-pack" cx="250" cy="185" r="9.5" />
      <circle className="ln-ci-pack" cx="282" cy="185" r="7.5" />
      <use href="#ci-s-hub" className="ln-ci-reel" x="243" y="178" width="14" height="14" style={{ transformOrigin: "250px 185px" }} />
      <use href="#ci-s-hub" className="ln-ci-reel" x="275" y="178" width="14" height="14" style={{ transformOrigin: "282px 185px" }} />
      <rect className="ln-ci-paper" x="232" y="200.5" width="68" height="22" rx="3" />
      <text className="ln-ci-hand" x="266" y="215.5" textAnchor="middle">{c.agent}</text>
      <FigureLamp cx={296} cy={169.4} r={3.4} state={lamp} />
      <rect className="ln-ci-slot" x="222" y="195" width="6" height="8" rx="1.5" />
    </svg>
  );
}

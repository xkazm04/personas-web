import { useTranslation } from "@/i18n/useTranslation";

/** The Overseer's gauge and the printed coaching note. `hot` raises the needle, `printed` feeds the note out, `kept` stamps it. */
export default function Overseer({ hot, printed, kept }: { hot: boolean; printed: boolean; kept: boolean }) {
  const { t } = useTranslation();
  const o = t.landingNext.runs.overseer;
  return (
    <div className="ln-panel">
      <div className="ln-panel-t">
        <h3>{o.title}</h3>
        <span className="ln-caption">{o.tag}</span>
      </div>
      <div className="ln-ov">
        <div>
          <div className={`ln-vu${hot ? " ln-hot" : ""}`} aria-hidden="true">
            <svg viewBox="0 0 240 150">
              <path className="ln-vu-arc" d="M30 118 A 100 100 0 0 1 210 118" fill="none" strokeWidth="2" />
              <path className="ln-vu-red" d="M168 64 A 100 100 0 0 1 210 118" fill="none" strokeWidth="6" />
              <path className="ln-vu-arc" d="M42 98l-9-5M64 72l-7-8M92 56l-4-9M120 50v-10M148 56l4-9M176 72l7-8M198 98l9-5" strokeWidth="2" />
              <text className="ln-vu-txt" x="120" y="96" textAnchor="middle" fontSize="13" letterSpacing="2">{o.vu.toUpperCase()}</text>
              <g className="ln-needle">
                <path className="ln-vu-needle" d="M120 150 L120 44" strokeWidth="2.5" strokeLinecap="round" />
              </g>
              <circle className="ln-vu-hub" cx="120" cy="150" r="10" />
            </svg>
          </div>
          <div className="ln-slot" aria-hidden="true" />
        </div>
        <p className="ln-ov-copy">{o.blurb}</p>
      </div>
      <div className={`ln-rc-clip${printed || kept ? " ln-printed" : ""}${kept ? " ln-kept" : ""}`}>
        <div className="ln-rc">
          <div className="ln-receipt ln-paper">
            <b>{o.receiptTitle.toUpperCase()}</b>
            <br />
            {o.receiptMeta}
            <hr />
            {o.failed}
            <br />
            {o.healed}
            <hr />
            <div className="ln-hand">{o.quote}</div>
            <hr />
            {o.sent} &rarr;
            <span className="ln-stamp">{o.stamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

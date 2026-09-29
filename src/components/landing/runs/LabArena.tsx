"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LnKeyButton } from "../shared/LnKey";

interface Props {
  side: "a" | "b";
  onSide: (s: "a" | "b") => void;
  kept: boolean;
  onApprove: () => void;
}

/** Side A / side B comparison with its score, and the human approval. */
export default function LabArena({ side, onSide, kept, onApprove }: Props) {
  const { t } = useTranslation();
  const l = t.landingNext.runs.lab;
  const n = side === "b" ? 4 : 3;
  return (
    <div className="ln-panel">
      <div className="ln-panel-t">
        <h3>{l.title}</h3>
        <span className="ln-caption">{l.tag}</span>
      </div>
      <div className="ln-ab">
        <div className={`ln-abswitch${side === "b" ? " ln-b" : ""}`} role="group" aria-label={l.switchLabel}>
          <i className="ln-thumb" />
          <button type="button" aria-pressed={side === "a"} onClick={() => onSide("a")}>{l.sideA}</button>
          <button type="button" aria-pressed={side === "b"} onClick={() => onSide("b")}>{l.sideB}</button>
        </div>
        <div className="ln-lcd ln-score" aria-live="polite" aria-atomic="true">
          <div className="ln-lcd-inner">
            <span className="ln-sr">{l.score.replace("{n}", String(n))}</span>
            <b className="ln-lcd-glow" aria-hidden="true">{n}/5</b>
            <span className="ln-pips" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((j) => (
                <i key={j} className={j < n ? "ln-on" : undefined} />
              ))}
            </span>
          </div>
        </div>
      </div>
      <p className="ln-lab-copy">{l.copy}</p>
      <div className="ln-approve-row">
        <LnKeyButton tone="signal" size="lg" className={kept ? "ln-is-down" : undefined} aria-pressed={kept} onClick={onApprove}>
          {kept ? `${l.approved} ✓` : l.approve}
        </LnKeyButton>
        <p aria-live="polite">{kept ? l.kept : l.waiting}</p>
      </div>
    </div>
  );
}

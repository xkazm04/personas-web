"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { LnKeyButton } from "../shared/LnKey";

type Decision = "proposed" | "approved" | "discarded";

/** A printed memory card: two approved lines and one proposal you approve or discard. */
export default function MemoryCard() {
  const { t } = useTranslation();
  const c = t.landingNext.companion;
  const [decision, setDecision] = useState<Decision>("proposed");

  return (
    <div className="ln-mem ln-paper" role="group" aria-label={c.memLabel}>
      <h3>{c.memTitle}</h3>
      <ul>
        {c.memItems.map((item) => (
          <li key={item}>
            {item} <small>{c.approved}</small>
          </li>
        ))}
        {decision === "proposed" ? (
          <li className="ln-prop">
            <span>
              {c.proposedLabel}: “{c.proposal}”
            </span>
            <span className="ln-acts">
              <LnKeyButton size="sm" tone="signal" onClick={() => setDecision("approved")}>
                {c.approve}
              </LnKeyButton>
              <LnKeyButton size="sm" onClick={() => setDecision("discarded")}>
                {c.discard}
              </LnKeyButton>
            </span>
          </li>
        ) : (
          <li aria-live="polite">
            {decision === "approved" ? (
              <>
                {c.proposal} <small>{c.approvedByYou}</small>
              </>
            ) : (
              <>
                <span className="ln-struck">{c.proposal}</span> <small>{c.discarded}</small>
              </>
            )}
          </li>
        )}
      </ul>
    </div>
  );
}

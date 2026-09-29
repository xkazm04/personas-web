"use client";

import { useTranslation } from "@/i18n/useTranslation";
import LnSectionHead from "../shared/LnSectionHead";
import ConceptDefs from "./ConceptDefs";
import LabelMaker from "./LabelMaker";
import PatchBay from "./PatchBay";
import Memory from "./Memory";
import HealFigure from "./Heal";
import TriggersFigure from "./Triggers";
import ApproveFigure from "./Approve";
import "./concepts.css";

/** "In one look": six short animated illustrations, one per core idea. */
export default function LandingConcepts() {
  const { t } = useTranslation();
  const c = t.landingNext.concepts;
  return (
    <section id="concepts" data-tour-diagram="agent-mind" className="ln-sec" aria-labelledby="concepts-h">
      <ConceptDefs />
      <div className="ln-wrap">
        <LnSectionHead kicker={c.kicker} headingId="concepts-h" heading={c.heading} accent={c.accent} lede={c.lede} />
        <div className="ln-ci-grid">
          <LabelMaker />
          <PatchBay />
          <Memory />
          <HealFigure />
          <TriggersFigure />
          <ApproveFigure />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { LnKeyButton } from "../shared/LnKey";
import BlueprintDrawing from "./BlueprintDrawing";
import "../blueprint/cover.css";

/**
 * The Blueprint skin's hero art: the mark drawn as a construction drawing that
 * plots itself in on arrival and again on request. Reduced motion shows the
 * finished drawing. Stylised drawing, not product UI.
 */
export default function BlueprintCover() {
  const { t } = useTranslation();
  const c = t.landingNext.heroBlueprint;
  const still = useStillMotion();
  // `run` is the plot's generation: a new number remounts the drawing, restarting every stroke.
  const [run, setRun] = useState(0);

  const replot = useCallback(() => {
    if (document.hidden) return;
    setRun((n) => n + 1);
  }, []);

  return (
    <figure className={`ln-bpc${still ? "" : " ln-bpc-run"}`}>
      <BlueprintDrawing key={run} c={c} />
      <figcaption className="ln-bpc-cap">
        <span className="ln-caption">{c.caption}</span>
        <LnKeyButton size="sm" icon="i-flip" onClick={replot} aria-disabled={still || undefined}>
          {c.replot}
        </LnKeyButton>
      </figcaption>
    </figure>
  );
}

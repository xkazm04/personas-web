"use client";

import { useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import { useSeenOnce } from "../shared/useSeenOnce";
import LnSectionHead from "../shared/LnSectionHead";
import ExplodeDiagram from "./ExplodeDiagram";
import NoCloudCallouts, { useLayerFocus } from "./NoCloudCallouts";
import NoCloudFaq from "./NoCloudFaq";
import "./nocloud.css";

/** "Why it is different": what runs locally, what costs nothing, what is never collected. */
export default function LandingNoCloud() {
  const { t } = useTranslation();
  const n = t.landingNext.nocloud;
  const ref = useRef<HTMLElement>(null);
  // The layers separate once, as the figure first scrolls into view.
  const seen = useSeenOnce(ref, 0.35);
  const still = useStillMotion();
  const focus = useLayerFocus();

  const cls = ["ln-nc-fig", seen && !still && "ln-x-play", focus.active ? `ln-x-on-${focus.active}` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section id="private" data-tour-diagram="platform" className="ln-sec" aria-labelledby="private-h">
      <div className="ln-wrap">
        <LnSectionHead kicker={n.kicker} headingId="private-h" heading={n.heading} accent="." />
        <div className="ln-nc">
          <figure ref={ref} className={cls} style={{ margin: 0 }}>
            <div role="img" aria-label={n.figureLabel}>
              <ExplodeDiagram />
            </div>
            <figcaption className="ln-caption">{n.caption}</figcaption>
          </figure>
          <NoCloudCallouts focus={focus} />
        </div>
        <p className="ln-nono">
          <span className="sr-only">{n.nono.label}</span>
          <span aria-hidden="true">{n.nono.diagrams}</span>
          <span aria-hidden="true">{n.nono.swarms}</span>
          <span aria-hidden="true">{n.nono.code}</span>
        </p>
        <NoCloudFaq />
      </div>
    </section>
  );
}

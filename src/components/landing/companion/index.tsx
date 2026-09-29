"use client";

import { useTranslation } from "@/i18n/useTranslation";
import LnSectionHead from "../shared/LnSectionHead";
import CompanionDevice from "./CompanionDevice";
import MemoryCard from "./MemoryCard";
import "./companion.css";

/** The always-on companion: what it does, and a stylised hold-to-talk demo (no microphone). */
export default function LandingCompanion() {
  const { t } = useTranslation();
  const c = t.landingNext.companion;

  return (
    <section id="companion" className="ln-sec" aria-labelledby="companion-h">
      <div className="ln-wrap ln-comp">
        <div>
          <LnSectionHead kicker={c.kicker} headingId="companion-h" heading={c.heading} accent={c.accent} lede={c.lede} />
          <ul className="ln-facts">
            {c.facts.map((f, i) => (
              <li key={f.title}>
                <span className="ln-num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <CompanionDevice />
          <MemoryCard />
        </div>
      </div>
    </section>
  );
}

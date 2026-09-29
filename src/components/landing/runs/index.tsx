"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import LnSectionHead from "../shared/LnSectionHead";
import LabArena from "./LabArena";
import Overseer from "./Overseer";
import RunsDeck from "./RunsDeck";
import { HOT_AT, PRINT_AT } from "./frames";
import { useRunsPlayer } from "./useRunsPlayer";
import "./runs.css";

/** A week of runs: it fails once, heals via retry, the Overseer coaches, and you approve the fix. */
export default function LandingRuns() {
  const { t } = useTranslation();
  const r = t.landingNext.runs;
  const deckRef = useRef<HTMLDivElement>(null);
  const player = useRunsPlayer(deckRef);
  const [side, setSide] = useState<"a" | "b">("a");
  const [kept, setKept] = useState(false);

  const approve = () => {
    const next = !kept;
    setKept(next);
    if (next) setSide("b");
  };

  return (
    <section id="runs" className="ln-sec ln-runs" aria-labelledby="runs-h">
      <div className="ln-wrap">
        <LnSectionHead kicker={r.kicker} headingId="runs-h" heading={r.heading} accent={r.accent} lede={r.lede} />
        <div className="ln-runs-grid">
          <RunsDeck deckRef={deckRef} {...player} />
          <Overseer hot={player.frame >= HOT_AT} printed={player.frame >= PRINT_AT} kept={kept} />
          <LabArena side={side} onSide={setSide} kept={kept} onApprove={approve} />
        </div>
      </div>
    </section>
  );
}

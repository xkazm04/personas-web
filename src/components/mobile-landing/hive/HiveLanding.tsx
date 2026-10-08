"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { GlyphSprite } from "./Glyphs";
import HiveChrome from "./HiveChrome";
import HeroPoster from "./HeroPoster";
import ReelPoster from "./ReelPoster";
import ToolSheet from "./ToolSheet";
import AthenaPoster from "./AthenaPoster";
import BillPoster from "./BillPoster";
import FaqPoster, { FaqSheet } from "./FaqPoster";
import HandoffPoster from "./HandoffPoster";
import HiveDock from "./HiveDock";
import { useChapters } from "./useChapters";
import { useHandoff } from "./useHandoff";
import { useHiveCopy } from "./useHiveCopy";
import type { ToolKey } from "./toolIcons";
import "./hive.css";

/**
 * /m - "Hive Reels", the phone landing (owner's pick of the 2026-10-06 mobile-landing contest).
 * A vertical film of six one-screen posters, each built from glowing hex cells: hero hive, tool
 * reel, Athena, the bill, questions, and the hand-off to a computer. One thumb, one column; the
 * dock button is always on screen.
 *
 * Motion: every timed beat checks `live` (on screen, tab visible, motion welcome); ambient CSS
 * loops run only on the active poster and pause on a hidden tab (.page-hidden); reduced motion
 * (data-still) stops all of it and shows each poster's finished frame. Markup never depends on it.
 */
export default function HiveLanding() {
  const { t, m } = useHiveCopy();
  const still = useStillMotion();
  const hidden = usePageVisibility();
  const filmRef = useRef<HTMLElement>(null);
  const [tool, setTool] = useState<ToolKey | null>(null);
  const [faq, setFaq] = useState<number | null>(null);
  const sheetOpen = tool !== null || faq !== null;
  const { cur, goTo } = useChapters(filmRef, still, sheetOpen);
  const live = (i: number) => cur === i && !still && !hidden;

  const [toastMsg, setToastMsg] = useState({ text: "", n: 0, show: false });
  const toast = useCallback((text: string) => setToastMsg((p) => ({ text, n: p.n + 1, show: true })), []);
  useEffect(() => {
    if (!toastMsg.n) return;
    const id = setTimeout(() => setToastMsg((p) => ({ ...p, show: false })), 2600);
    return () => clearTimeout(id);
  }, [toastMsg.n]);

  const handoff = useHandoff(m.cta, t, still, toast);
  const names = { win: t.downloadSection.windows, mac: t.downloadSection.macos, lin: t.downloadSection.linux };
  const closeTool = useCallback(() => setTool(null), []);
  const closeFaq = useCallback(() => setFaq(null), []);

  return (
    <div className="hm" data-still={still ? "true" : "false"}>
      <GlyphSprite />
      <div className="phone">
        <HiveChrome m={m} cur={cur} still={still} inert={sheetOpen} onGo={goTo} />
        <main className="film" id="main-content" ref={filmRef} inert={sheetOpen} aria-hidden={sheetOpen || undefined}>
          <HeroPoster h={m.hero} tag={m.illustrationTag} on={cur === 0} live={live(0)} still={still} />
          <ReelPoster u={m.useCases} tools={t.useCasesSection} tag={m.illustrationTag} on={cur === 1} live={live(1)} still={still} paused={sheetOpen} onOpenTool={setTool} />
          <AthenaPoster a={m.athena} on={cur === 2} live={live(2)} still={still} />
          <BillPoster p={m.pricing} tag={m.illustrationTag} on={cur === 3} still={still} />
          <FaqPoster f={m.faq} tag={m.illustrationTag} on={cur === 4} onOpen={setFaq} />
          <HandoffPoster c={m.cta} h={handoff} names={names} tag={m.illustrationTag} on={cur === 5} />
        </main>
        <div inert={sheetOpen} aria-hidden={sheetOpen || undefined}>
          <HiveDock c={m.cta} h={handoff} atEnd={cur === 5} onGo={() => goTo(5)} />
        </div>
        <ToolSheet tool={tool} onHop={setTool} onClose={closeTool} u={m.useCases} tools={t.useCasesSection} back={m.back} still={still} />
        <FaqSheet index={faq} onStep={setFaq} onClose={closeFaq} f={m.faq} back={m.back} questions={t.faqSection.questions} still={still} />
        <div className={`toast${toastMsg.show ? " show" : ""}`} role="status" aria-live="polite">
          {toastMsg.text}
        </div>
      </div>
    </div>
  );
}

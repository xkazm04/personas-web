"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useClockEngine, INITIAL_BEAT, type ClockBeat } from "./useClockEngine";
import { useHandoff } from "./useHandoff";
import { useClockCopy } from "./copy";
import { cardsFor, type CardData } from "./cards";
import { Sky } from "./Sky";
import { Dial } from "./Dial";
import { HeroChapter } from "./HeroChapter";
import { ToolsChapter } from "./ToolsChapter";
import { AthenaChapter, PriceChapter } from "./NightChapters";
import { Faq } from "./Faq";
import { Cta } from "./Cta";
import { CardLayer, type OpenCard } from "./CardLayer";
import { Bar, Rail, Toast, Top } from "./Chrome";
import { Emblem, StageHud } from "./StageHud";
import type { Opener } from "./DialFace";
import s from "./clock.module.css";

const SPACERS = [s.sp0, s.sp1, s.sp2, s.sp3, s.sp4, s.sp5];

/**
 * /m2 "Around the Clock": the page is a day. One 24-hour dial under a sky graded by the hour;
 * the thumb is the clock. Ported from the contest entry (owner verdict M5, 2026-10-06).
 */
export default function ClockLanding() {
  const c = useClockCopy();
  const still = useStillMotion();
  const tabHidden = usePageVisibility();
  const col = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState<ClockBeat>(INITIAL_BEAT);
  const engine = useClockEngine(col, setBeat);
  const cards = useMemo(() => cardsFor(c), [c]);

  const [card, setCard] = useState<OpenCard | null>(null);
  const [open, setOpen] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [toast, setToast] = useState({ msg: "", show: false });
  const toastTimer = useRef(0);
  const say = useCallback((msg: string) => {
    setToast({ msg, show: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, show: false })), 2300);
  }, []);
  const handoff = useHandoff(c, say);

  // The hero's few minutes walk on their own while the hero holds the stage (an ambient loop:
  // still under reduced motion, stopped on a hidden tab or while a card is open).
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (still || tabHidden || open || beat.dom !== 0) return;
    const id = window.setInterval(() => setStep((n) => (n + 1) % 3), 2800);
    return () => window.clearInterval(id);
  }, [still, tabHidden, open, beat.dom]);

  const show = useCallback((data: CardData, ...[e, el]: Parameters<Opener>) => {
    const box = col.current?.getBoundingClientRect();
    let ox = (box?.width ?? 390) / 2;
    let oy = (box?.height ?? 800) * 0.6;
    const pt = "clientX" in e && e.clientX ? e : null;
    if (box && pt) {
      ox = pt.clientX - box.left;
      oy = pt.clientY - box.top;
    } else if (box) {
      const r = el.getBoundingClientRect();
      ox = r.left + r.width / 2 - box.left;
      oy = r.top + r.height / 2 - box.top;
    }
    lastFocus.current = el instanceof HTMLElement || el instanceof SVGElement ? (el as HTMLElement) : null;
    setCard({ data, ox, oy });
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    const f = lastFocus.current;
    lastFocus.current = null;
    if (f?.isConnected) f.focus({ preventScroll: true });
  }, []);

  const go = (i: number) => engine.current?.go(i);
  return (
    <div className={s.shell}>
      <div ref={col} className={s.col} data-arriving="" data-still={still ? "" : undefined}>
        <Emblem />
        <Sky />
        <Top c={c} ci={beat.ci} flow={beat.flow} inert={open} onHome={() => go(0)} />
        <Rail c={c} ci={beat.ci} inert={open} onGo={go} />
        <div className={s.scroller} data-k="scroller" tabIndex={-1} inert={open}>
          <main id="main-content">
            <div className={s.track}>
              <div className={s.stage} data-k="stage" data-ch={beat.dom}>
                <Dial
                  c={c}
                  tool={beat.tool}
                  dom={beat.dom}
                  price={beat.price}
                  mom={beat.mom}
                  athenaLive={beat.athena && !still && !tabHidden}
                  onRun={(k, e, el) => show(cards.run(k), e, el)}
                  onTool={(k) => engine.current?.jumpTool(k)}
                  onNode={(i, e, el) => show(cards.node(i), e, el)}
                />
                <div className={s.fog} aria-hidden="true" />
                <StageHud c={c} />
                <HeroChapter c={c} step={step} onStep={(n, e, el) => (setStep(n), show(cards.step(n), e, el))} />
                <ToolsChapter
                  c={c}
                  tool={beat.tool}
                  job={beat.job}
                  onPersona={(e, el) => show(cards.persona(), e, el)}
                  onJob={(k, e, el) => show(cards.job(beat.tool, k), e, el)}
                />
                <AthenaChapter c={c} mom={beat.mom} onMoment={(i, e, el) => show(cards.moment(i), e, el)} />
                <PriceChapter c={c} price={beat.price} onNode={(i, e, el) => show(cards.node(i), e, el)} />
              </div>
              {SPACERS.map((cls, i) => (
                <div key={i} className={cls} data-sp={i} />
              ))}
            </div>
            <Faq c={c} />
            <Cta c={c} handoff={handoff} />
            <footer className={s.foot}>
              <p>{c.footer.facts}</p>
              <p className={s.fine}>{c.footer.stylized}</p>
              <div className={s.themes}>
                <span className={s.themesLabel}>{c.chrome.themeLabel}</span>
                <ThemeSwitcher />
              </div>
            </footer>
          </main>
        </div>
        <Bar c={c} atCta={beat.ci === 5} inert={open} onGo={() => go(5)} onRemind={handoff.remind} />
        <CardLayer card={card} open={open} backLabel={c.card.back} onClose={close} />
        <Toast msg={toast.msg} show={toast.show} />
      </div>
    </div>
  );
}

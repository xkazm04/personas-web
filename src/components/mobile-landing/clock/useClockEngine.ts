"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { MOMENT_HOURS, PRICE_HOURS, TOOLS } from "./data";
import {
  beatAt,
  buildKeys,
  chapterOpacity,
  clamp,
  cullLabel,
  dominantChapter,
  FAQ_HOUR,
  CTA_HOUR,
  hhmm,
  hourAt,
  lerp,
  skyAt,
  sstep,
  stageLeave,
  type Win,
} from "./geometry";
import { pulseAt } from "./art";

/** Discrete story state the engine hands to React; it changes a few dozen times per full scroll. */
export interface ClockBeat {
  /** Chapter owning the stage: 0 hero, 1 tools, 2 Athena, 3 pricing. */
  dom: 0 | 1 | 2 | 3;
  /** Chapter for the chrome (chip, rail, pill): 0-3 as dom, 4 FAQ, 5 CTA. */
  ci: number;
  tool: number;
  job: number;
  mom: number;
  price: number;
  /** Athena's portrait is up and her idle loop may play. */
  athena: boolean;
  /** The flowing chapters (FAQ, CTA) are on screen: the chip steps aside. */
  flow: boolean;
}

export const INITIAL_BEAT: ClockBeat = { dom: 0, ci: 0, tool: 0, job: 0, mom: 0, price: 0, athena: false, flow: false };

export interface ClockEngine {
  go(chapter: number): void;
  jumpTool(k: number): void;
  jumpMoment(k: number): void;
}

interface Cull {
  el: Element;
  h: number;
  r: number;
  pad: number;
  hidden?: boolean;
}

const sameBeat = (a: ClockBeat, b: ClockBeat) =>
  a.dom === b.dom && a.ci === b.ci && a.tool === b.tool && a.job === b.job && a.mom === b.mom && a.price === b.price && a.athena === b.athena && a.flow === b.flow;

/**
 * The scroll engine: the scroller's offset turns the dial, grades the sky, cross-fades the four
 * pinned chapters and walks the beats. Continuous values (rotation, opacity, the clock's digits)
 * are written straight to the DOM inside one rAF; discrete beats go to React through `onBeat`.
 *
 * It finds its parts by `data-k` hooks inside `root`. Reduced motion (useStillMotion) snaps the
 * story between chapters with no tweening and no arrival; a hidden tab (usePageVisibility) stops
 * the frame loop. Neither decides markup: the engine only writes after mount.
 */
export function useClockEngine(root: RefObject<HTMLElement | null>, onBeat: (b: ClockBeat) => void): RefObject<ClockEngine | null> {
  const still = useStillMotion();
  const tabHidden = usePageVisibility();
  const api = useRef<ClockEngine | null>(null);
  const live = useRef({ still, tabHidden, onBeat });
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    live.current = { still, tabHidden, onBeat };
    kick.current();
  }, [still, tabHidden, onBeat]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = <T extends Element = HTMLElement>(k: string) => el.querySelector(`[data-k="${k}"]`) as T | null;
    const scroller = q("scroller");
    const stage = q("stage");
    if (!scroller || !stage) return;
    const digits = q("digits");
    const dialRot = q("dialRot");
    const sky = { dawn: q("skDawn"), day: q("skDay"), dusk: q("skDusk"), stars: q("stars"), sun: q("sun"), moon: q("moon") };
    const rimWarm = q("rimWarm");
    const rimCool = q("rimCool");
    const athena = q("athena");
    const pulse = q<SVGCircleElement>("pulse");
    const swipeHint = q("swipeHint");
    const layer = q("layer");
    const chEls = [0, 1, 2, 3].map((i) => q(`ch${i}`));
    const spacers = Array.from(el.querySelectorAll<HTMLElement>("[data-sp]"));
    const faq = q("faq");
    const cta = q("cta");
    const culls: Cull[] = Array.from(el.querySelectorAll("[data-cull-h]")).map((c) => ({
      el: c,
      h: Number(c.getAttribute("data-cull-h")),
      r: Number(c.getAttribute("data-cull-r")),
      pad: Number(c.getAttribute("data-cull-pad")),
    }));

    const M = { H: 800, W: 390, u: 3.9, win: [] as Win[], faqTop: 0, ctaTop: 0, max: 0, keys: [] as [number, number][] };
    const cur = { rot: NaN, portrait: false, time: "", beat: { ...INITIAL_BEAT } };
    let intro = false;
    let introT0 = 0;
    let introTimer = 0;
    let raf = 0;
    const isLight = () => (document.documentElement.getAttribute("data-theme") ?? "").startsWith("light");
    const rm = () => live.current.still;
    const off = () => live.current.tabHidden || document.hidden;

    function measure() {
      M.H = scroller!.clientHeight || 800;
      M.W = scroller!.clientWidth || 390;
      const sh = stage!.offsetHeight;
      M.win = spacers.map((sp) => ({ s: sp.offsetTop - sh, e: sp.offsetTop + sp.offsetHeight - sh }));
      M.faqTop = faq?.offsetTop ?? 0;
      M.ctaTop = cta?.offsetTop ?? 0;
      M.max = Math.max(1, scroller!.scrollHeight - M.H);
      M.u = Math.min(M.W / 100, M.H * 0.0046);
      M.keys = buildKeys(
        { H: M.H, win: M.win, faqTop: M.faqTop, ctaTop: M.ctaTop, ctaHeight: cta?.offsetHeight ?? M.H, max: M.max },
        TOOLS.map((t) => t.hour),
        MOMENT_HOURS,
        PRICE_HOURS,
      );
    }

    function placeBody(b: HTMLElement | null, u: number, vis: number) {
      if (!b) return;
      const o = sstep(-0.04, 0.1, u) * (1 - sstep(0.9, 1.04, u)) * vis;
      if (o < 0.01) {
        b.style.opacity = "0";
        return;
      }
      const horizon = M.H * 0.36;
      const apex = M.H * 0.15;
      const uu = clamp(u, -0.1, 1.1);
      b.style.opacity = o.toFixed(3);
      b.style.transform = `translate(${(M.W * (0.07 + 0.86 * uu)).toFixed(1)}px,${(horizon - (horizon - apex) * Math.sin(Math.PI * uu)).toFixed(1)}px)`;
    }

    function render(force: boolean) {
      const w = M.win;
      if (w.length < 6) return;
      const x = scroller!.scrollTop;
      const H = M.H;
      const still = rm();
      const op = chapterOpacity(w, H, x);
      const dom = dominantChapter(w, H, x);
      if (still) for (let k = 0; k < 4; k++) op[k] = k === dom ? 1 : 0;
      const b1 = beatAt(w[1], TOOLS.length, x);
      const b2 = beatAt(w[3], MOMENT_HOURS.length, x);
      const b3 = beatAt(w[5], PRICE_HOURS.length, x);
      const inFlow = x >= M.faqTop - 0.5 * H;
      const inCta = x >= M.ctaTop - 0.5 * H;

      let hour: number;
      if (intro && x < 8) {
        const t = clamp((performance.now() - introT0) / 1500, 0, 1);
        hour = lerp(5, 9, t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        if (t >= 1) intro = false;
      } else if (still) {
        hour = inCta ? CTA_HOUR : inFlow ? FAQ_HOUR : dom === 0 ? 9 : dom === 1 ? TOOLS[b1.shown].hour : dom === 2 ? MOMENT_HOURS[b2.shown] : PRICE_HOURS[b3.shown];
      } else {
        hour = hourAt(M.keys, x);
      }
      const h24 = ((hour % 24) + 24) % 24;
      const timeStr = hhmm(hour);

      // The dial turns; labels on its lower half, past the edge or under Athena hide.
      const rot = -hour * 15;
      const portrait = dom === 2 && op[2] > 0.04;
      if (force || cur.rot !== rot || cur.portrait !== portrait) {
        if (dialRot) dialRot.style.transform = `rotate(${rot.toFixed(2)}deg)`;
        cur.rot = rot;
        cur.portrait = portrait;
        const scale = 0.25 * M.u;
        for (const c of culls) {
          const hide = cullLabel(c.h, rot, c.r, c.pad, scale, M.W / 2, portrait);
          if (hide !== c.hidden) {
            c.hidden = hide;
            if (hide) c.el.setAttribute("data-cull", "");
            else c.el.removeAttribute("data-cull");
          }
        }
      }
      if (digits && timeStr !== cur.time) {
        digits.textContent = timeStr;
        cur.time = timeStr;
      }

      // The sky.
      const S = skyAt(h24);
      if (sky.dawn) sky.dawn.style.opacity = S.dawn.toFixed(3);
      if (sky.day) sky.day.style.opacity = S.day.toFixed(3);
      if (sky.dusk) sky.dusk.style.opacity = S.dusk.toFixed(3);
      if (sky.stars) sky.stars.style.opacity = (S.night * (isLight() ? 0.5 : 1)).toFixed(3);
      const warm = clamp(S.dawn + S.dusk, 0, 1);
      if (rimWarm) rimWarm.style.opacity = warm.toFixed(3);
      if (rimCool) rimCool.style.opacity = (1 - warm * 0.8).toFixed(3);
      placeBody(sky.sun, (h24 - 6) / 12, 1);
      placeBody(sky.moon, ((((h24 - 18) % 24) + 24) % 24) / 12, 1 - op[2]);

      // Chapters cross-fade.
      for (let k = 0; k < 4; k++) {
        const c = chEls[k];
        if (!c) continue;
        const o = op[k];
        if (o > 0.015) {
          if (!c.hasAttribute("data-on")) {
            c.setAttribute("data-on", "");
            c.removeAttribute("inert");
          }
          c.style.opacity = o.toFixed(3);
          c.style.transform = still ? "" : `translateY(${((1 - o) * 16).toFixed(1)}px)`;
        } else if (c.hasAttribute("data-on")) {
          c.removeAttribute("data-on");
          c.style.opacity = "0";
          c.setAttribute("inert", "");
        }
      }
      // Athena rises as the moon.
      const ao = op[2];
      if (athena) {
        if (ao > 0.015) {
          athena.style.visibility = "visible";
          athena.style.opacity = ao.toFixed(3);
          athena.style.transform = still ? "" : `translateY(${((1 - ao) * 40).toFixed(1)}px) scale(${(0.92 + 0.08 * ao).toFixed(3)})`;
        } else {
          athena.style.visibility = "hidden";
          athena.style.opacity = "0";
        }
      }
      // Defect fix (host pass): the stage fades out across its unpin instead of sliding "Free."
      // and the dial up over the FAQ's clock.
      const leave = still ? (x > w[5].e + 0.15 * H ? 0 : 1) : stageLeave(w, H, x);
      stage!.style.opacity = leave < 0.999 ? leave.toFixed(3) : "";
      stage!.style.visibility = leave < 0.01 ? "hidden" : "";

      if (pulse && dom === 3) {
        const p = pulseAt(b3.idx);
        pulse.setAttribute("cx", p.cx);
        pulse.setAttribute("cy", p.cy);
        pulse.style.opacity = p.opacity;
      }
      if (swipeHint) swipeHint.style.opacity = x > 24 ? "0" : "1";

      const beat: ClockBeat = {
        dom,
        ci: inCta ? 5 : inFlow ? 4 : dom,
        tool: b1.shown,
        job: b1.shown === b1.i ? (b1.f < 0.2 ? 0 : b1.f < 0.42 ? 1 : 2) : 0,
        mom: b2.shown,
        price: b3.shown,
        athena: dom === 2 && ao > 0.5,
        flow: x > M.faqTop - 0.3 * H,
      };
      if (!sameBeat(beat, cur.beat)) {
        cur.beat = beat;
        live.current.onBeat(beat);
      }
    }

    function tick() {
      raf = 0;
      if (off()) return;
      render(false);
      if (intro) schedule();
    }
    function schedule() {
      if (raf || off()) return;
      raf = requestAnimationFrame(tick);
    }
    function endIntro() {
      if (!intro && !el!.hasAttribute("data-arriving")) return;
      intro = false;
      window.clearTimeout(introTimer);
      el!.removeAttribute("data-arriving");
      schedule();
    }

    const scrollToY = (y: number) => {
      const top = Math.max(0, Math.round(y));
      try {
        scroller!.scrollTo({ top, behavior: rm() ? "auto" : "smooth" });
      } catch {
        scroller!.scrollTop = top;
      }
    };
    const anchorY = (i: number) => {
      const w = M.win;
      return [0, w[1].s + 0.16 * M.H, w[3].s + 0.12 * M.H, w[5].s + 0.12 * M.H, M.faqTop, M.ctaTop][i] ?? 0;
    };
    const stops = () => {
      const w = M.win;
      const S = [0];
      const add = (win: Win, n: number) => {
        const B = (win.e - win.s) / n;
        for (let i = 0; i < n; i++) S.push(win.s + i * B + B * 0.12);
      };
      add(w[1], TOOLS.length);
      add(w[3], MOMENT_HOURS.length);
      add(w[5], PRICE_HOURS.length);
      S.push(M.faqTop, M.ctaTop);
      return S;
    };
    api.current = {
      go: (i) => scrollToY(anchorY(i)),
      jumpTool: (k) => {
        const w = M.win[1];
        const B = (w.e - w.s) / TOOLS.length;
        scrollToY(w.s + k * B + B * 0.12);
      },
      jumpMoment: (k) => {
        const w = M.win[3];
        const B = (w.e - w.s) / MOMENT_HOURS.length;
        scrollToY(w.s + k * B + B * 0.12);
      },
    };

    // Page keys step chapter by chapter through the pinned stage.
    function onKey(e: KeyboardEvent) {
      if (layer?.hasAttribute("data-open") || e.altKey || e.ctrlKey || e.metaKey) return;
      const k = e.key;
      let dir = 0;
      if (k === "PageDown" || k === "ArrowDown" || (k === " " && !e.shiftKey)) dir = 1;
      else if (k === "PageUp" || k === "ArrowUp" || (k === " " && e.shiftKey)) dir = -1;
      else return;
      const t = e.target as Element | null;
      if (t?.closest?.('input,textarea,select,[contenteditable],[role="slider"]')) return;
      if (k === " " && t?.closest?.('button,a,[role="button"]')) return;
      const x = scroller!.scrollTop;
      if (x > M.faqTop + 8 || (x >= M.faqTop - 8 && dir > 0)) return;
      const S = stops();
      let i = 0;
      for (let n = 0; n < S.length; n++) if (S[n] <= x + 6) i = n;
      const target = dir > 0 ? S[Math.min(S.length - 1, i + 1)] : x - S[i] > 10 ? S[i] : S[Math.max(0, i - 1)];
      e.preventDefault();
      scrollToY(target);
    }

    const onScroll = () => schedule();
    const relayout = () => {
      measure();
      render(true);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("scroll", endIntro, { passive: true });
    document.addEventListener("keydown", onKey);
    const introEvents = ["pointerdown", "wheel", "touchstart", "keydown"] as const;
    for (const n of introEvents) window.addEventListener(n, endIntro, { passive: true, capture: true });
    const ro = new ResizeObserver(relayout);
    ro.observe(scroller);
    window.addEventListener("load", relayout);
    const mo = new MutationObserver(() => render(true));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    measure();
    if (!rm() && !off()) {
      intro = true;
      introT0 = performance.now();
      introTimer = window.setTimeout(() => el.removeAttribute("data-arriving"), 2200);
    } else {
      el.removeAttribute("data-arriving");
    }
    render(true);
    schedule();
    // A hook for tests and tools: the engine has measured and drawn the first frame.
    el.setAttribute("data-ready", "");
    kick.current = () => {
      if (rm()) endIntro();
      if (off()) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        render(true);
        schedule();
      }
    };

    return () => {
      kick.current = () => {};
      api.current = null;
      cancelAnimationFrame(raf);
      window.clearTimeout(introTimer);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("scroll", endIntro);
      document.removeEventListener("keydown", onKey);
      for (const n of introEvents) window.removeEventListener(n, endIntro, { capture: true });
      ro.disconnect();
      window.removeEventListener("load", relayout);
      mo.disconnect();
    };
  }, [root]);

  return api;
}

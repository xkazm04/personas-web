"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { HERO_EVENTS } from "./data";

interface HeroWords {
  ev: string;
  done: string;
}

const TONE_VAR = { cy: "var(--cy)", em: "var(--em)", am: "var(--am)" } as const;

/**
 * The hero's arrival beat, ported from the winner's heroPlay(): an event gem drops into the hive, a
 * ripple crosses the cells, the team lights one by one, works, and a "done" token rises. About
 * 3.5 s, then it idles and plays the next event every 7.2 s while the hero is on screen.
 *
 * The cells are many and their classes change on a stagger, so the beat drives them through the
 * DOM like the winner did (React renders the cells once and never touches their classes again).
 * Reduced motion shows the finished frame; a hidden tab or an off-screen hero runs nothing.
 */
export function useHeroBeat(hiveRef: RefObject<HTMLDivElement | null>, words: HeroWords[], live: boolean, still: boolean) {
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const busy = useRef(false);
  const wordsRef = useRef(words);
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  const parts = useCallback(() => {
    const hive = hiveRef.current;
    if (!hive) return null;
    const ring: Element[] = [];
    hive.querySelectorAll("[data-slot]").forEach((g) => {
      const s = Number(g.getAttribute("data-slot"));
      if (s >= 0) ring[s] = g;
    });
    return { hive, ring, gem: hive.querySelector(".gem")!, tok: hive.querySelector(".tok")!, hub: hive.querySelector<HTMLElement>(".hub span")! };
  }, [hiveRef]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    busy.current = false;
  };

  const setHub = (hub: HTMLElement, text: string) => {
    hub.classList.remove("in");
    if (!text) return;
    hub.textContent = text;
    hub.classList.toggle("lg", text.length > 7);
    void hub.offsetWidth;
    hub.classList.add("in");
  };

  const final = useCallback(
    (i: number) => {
      const p = parts();
      if (!p) return;
      const team = HERO_EVENTS[i].team;
      p.hive.style.setProperty("--team", TONE_VAR[HERO_EVENTS[i].tone]);
      p.ring.forEach((g, k) => {
        g.classList.toggle("team", team.includes(k));
        g.classList.toggle("on", team.includes(k));
        g.classList.remove("w");
      });
      p.hive.classList.remove("hot", "rip");
      p.hive.classList.add("skipped", "armed");
      p.gem.className = "gem";
      p.tok.className = "tok";
      setHub(p.hub, wordsRef.current[i].done);
      busy.current = false;
    },
    [parts],
  );

  const play = useCallback(
    (i: number) => {
      clear();
      const p = parts();
      if (!p) return;
      const e = HERO_EVENTS[i];
      const w = wordsRef.current[i];
      const at = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
      p.hive.style.setProperty("--team", TONE_VAR[e.tone]);
      p.ring.forEach((g, k) => {
        g.classList.toggle("team", e.team.includes(k));
        g.classList.remove("on", "w");
      });
      p.hive.classList.remove("rip", "hot", "skipped", "armed");
      p.gem.className = "gem";
      p.tok.className = "tok";
      setHub(p.hub, "");
      busy.current = true;
      void (p.gem as HTMLElement).offsetWidth;
      p.gem.classList.add("drop");
      at(() => {
        p.gem.className = "gem hit";
        p.hive.classList.add("hot", "armed");
        p.hive.classList.remove("rip");
        void p.hive.offsetWidth;
        p.hive.classList.add("rip");
      }, 760);
      at(() => (p.gem.className = "gem"), 1230);
      at(() => setHub(p.hub, w.ev), 1150);
      e.team.forEach((k, n) => at(() => p.ring[k].classList.add("on"), 950 + n * 100));
      at(() => {
        e.team.forEach((k, n) => {
          (p.ring[k].firstElementChild as SVGElement).style.animationDelay = `${n * 90}ms`;
          p.ring[k].classList.add("w");
        });
      }, 1750);
      at(() => {
        setHub(p.hub, "");
        p.tok.className = "tok rise";
      }, 2350);
      at(() => setHub(p.hub, w.done), 3050);
      at(() => {
        p.hive.classList.remove("rip");
        busy.current = false;
        p.ring.forEach((g) => g.classList.remove("w"));
      }, 3500);
      at(() => (p.tok.className = "tok"), 3950);
    },
    [parts],
  );

  // On screen and allowed to move: play the current event, then idle through the others.
  useEffect(() => {
    if (still) {
      clear();
      final(idxRef.current);
      return;
    }
    if (!live) return;
    const sched = () => {
      idle.current = setTimeout(() => {
        if (!busy.current) {
          const next = (idxRef.current + 1) % HERO_EVENTS.length;
          idxRef.current = next;
          setIdx(next);
          play(next);
        }
        sched();
      }, 7200);
    };
    const start = setTimeout(() => {
      play(idxRef.current);
      sched();
    }, 380);
    return () => {
      clearTimeout(start);
      clearTimeout(idle.current);
      clear();
    };
  }, [live, still, play, final]);

  /** A chip tap: play that event now (or show it finished under reduced motion). */
  const pick = (i: number) => {
    idxRef.current = i;
    setIdx(i);
    if (still) final(i);
    else play(i);
  };

  /** A tap anywhere on the hero skips a running beat to its finished frame. */
  const skip = () => {
    if (busy.current) final(idxRef.current);
  };

  return { idx, pick, skip };
}

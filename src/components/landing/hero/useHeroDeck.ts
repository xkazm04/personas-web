"use client";

import { useEffect, useRef, useState } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTyper } from "../shared/useTyper";
import { useAmbientLive } from "../shared/useAmbientLive";

const SPRING = "cubic-bezier(.3,1.4,.5,1)";
const START_INDEX = 1;

/**
 * State of the hero art: which example persona is loaded, whether its reels
 * run, and the request typed on the screen.
 *
 * Until the art is on screen (and motion is allowed) the request is shown
 * finished, so the server render, reduced-motion visitors and the first paint
 * all read the same complete line; typing starts once, from `live`.
 */
export function useHeroDeck(requests: readonly string[]) {
  const figRef = useRef<HTMLElement>(null);
  const bayRef = useRef<HTMLDivElement>(null);
  const live = useAmbientLive(figRef);
  const still = useStillMotion();
  const [index, setIndex] = useState(START_INDEX);
  const [playing, setPlaying] = useState(true);
  const [typing, setTyping] = useState(false);
  const busy = useRef(false);
  const dropIn = useRef(false);
  const { shown, type } = useTyper(60);
  const total = requests.length;
  const current = requests[index] ?? "";

  // First typing pass, once the art is visible.
  useEffect(() => {
    if (!live || typing) return;
    const id = setTimeout(() => {
      setTyping(true);
      void type(current);
    }, 500);
    return () => clearTimeout(id);
  }, [live, typing, type, current]);

  // Drop the freshly loaded example into its slot.
  useEffect(() => {
    if (!dropIn.current) return;
    dropIn.current = false;
    const el = bayRef.current?.firstElementChild as HTMLElement | null;
    if (!el || still || document.hidden) return;
    el.animate(
      [
        { transform: "translateY(-30em)", opacity: 0, easing: "cubic-bezier(.55,0,.85,.35)" },
        { transform: "translateY(.8em)", opacity: 1, offset: 0.7, easing: SPRING },
        { transform: "none", opacity: 1 },
      ],
      { duration: 520 },
    );
  }, [index, still]);

  const next = () => {
    if (busy.current) return;
    busy.current = true;
    const ni = (index + 1) % total;
    const swap = () => {
      dropIn.current = true;
      setIndex(ni);
      setTyping(true);
      void type(requests[ni] ?? "");
      busy.current = false;
    };
    const el = bayRef.current?.firstElementChild as HTMLElement | null;
    if (!el || still || document.hidden) {
      swap();
      return;
    }
    el.animate(
      [{ transform: "none" }, { transform: "translateY(-7em)", offset: 0.4 }, { transform: "translateY(-30em)", opacity: 0 }],
      { duration: 520, easing: "cubic-bezier(.2,.9,.4,1)", fill: "forwards" },
    ).finished.then(swap, swap);
  };

  return {
    figRef,
    bayRef,
    live,
    index,
    playing,
    togglePlaying: () => setPlaying((p) => !p),
    next,
    request: typing ? shown : current,
    typingNow: typing && shown.length < current.length,
  };
}

"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export const POSTER_COUNT = 6;

/**
 * Which poster of the film is on screen (the winner's IntersectionObserver at 0.55), a way to jump
 * to one, and the keyboard paging the winner had (Arrow/Page Up and Down) while no sheet is open.
 */
export function useChapters(filmRef: RefObject<HTMLElement | null>, still: boolean, sheetOpen: boolean) {
  const [cur, setCur] = useState(0);
  const curRef = useRef(0);

  useEffect(() => {
    const film = filmRef.current;
    if (!film || !("IntersectionObserver" in window)) return;
    const posters = Array.from(film.querySelectorAll<HTMLElement>("[data-poster]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.intersectionRatio < 0.55) continue;
          const i = posters.indexOf(e.target as HTMLElement);
          if (i >= 0 && i !== curRef.current) {
            curRef.current = i;
            setCur(i);
          }
        }
      },
      { root: film, threshold: [0.55, 0.8] },
    );
    posters.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, [filmRef]);

  const goTo = useCallback(
    (i: number) => {
      const film = filmRef.current;
      const p = film?.querySelectorAll<HTMLElement>("[data-poster]")[Math.max(0, Math.min(POSTER_COUNT - 1, i))];
      if (!film || !p) return;
      try {
        p.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
      } catch {
        film.scrollTop = p.offsetTop;
      }
    },
    [filmRef, still],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (sheetOpen || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goTo(curRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goTo(curRef.current - 1);
      }
    };
    // A wheel outside the phone column (desktop) still scrolls the film, as in the winner.
    const onWheel = (e: WheelEvent) => {
      const film = filmRef.current;
      if (film && !film.parentElement?.contains(e.target as Node)) film.scrollBy(0, e.deltaY);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("wheel", onWheel);
    };
  }, [goTo, sheetOpen, filmRef]);

  return { cur, goTo };
}

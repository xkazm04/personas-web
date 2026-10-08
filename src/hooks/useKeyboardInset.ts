"use client";

import { useSyncExternalStore } from "react";

/**
 * How many CSS pixels of the layout viewport the on-screen keyboard covers,
 * from `visualViewport` (0 when no keyboard is open, on the server, or where
 * the API is missing). A `position: fixed` sheet is laid out against the
 * layout viewport, which iOS Safari and Chrome on Android (by default) do not
 * shrink for the keyboard, so a composer at its bottom would sit under it;
 * lifting the sheet by this much keeps the composer in view.
 *
 * Small differences (the URL bar collapsing, pinch zoom) are not a keyboard:
 * anything under `MIN_KEYBOARD_PX` reads 0, so the sheet does not jitter.
 */
const MIN_KEYBOARD_PX = 80;

function subscribe(cb: () => void): () => void {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener("resize", cb);
  vv.addEventListener("scroll", cb);
  return () => {
    vv.removeEventListener("resize", cb);
    vv.removeEventListener("scroll", cb);
  };
}

/** Pure, for the test: the keyboard's overlap given the two viewports. */
export function keyboardInset(layoutHeight: number, visualHeight: number, visualOffsetTop: number): number {
  const covered = Math.round(layoutHeight - visualHeight - visualOffsetTop);
  return covered >= MIN_KEYBOARD_PX ? covered : 0;
}

function getSnapshot(): number {
  const vv = window.visualViewport;
  return vv ? keyboardInset(window.innerHeight, vv.height, vv.offsetTop) : 0;
}

const getServerSnapshot = () => 0;

export function useKeyboardInset(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

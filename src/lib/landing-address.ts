import { LANDING_SECTIONS } from "./constants";

/* ── The home page's address space ──────────────────────────────────
 *
 * `LANDING_SECTIONS` declares the ids a visitor can be sent to (`/#download`,
 * `/#faq`, ...). Most of those sections are `ssr: false` and viewport-gated
 * (`<LazyMount>`), so the id does not exist at first paint: the browser's
 * one-shot fragment scroll and Next's layout-router both drop a hash with no
 * DOM node, and the visitor lands at the top of the hero. Each stage therefore
 * carries an always-present wrapper (`data-scroll-anchor` in `app/page.tsx`)
 * that can be scrolled to before the section exists; scrolling there mounts it.
 *
 * This module is the ONE resolver for that address space. Pure — no DOM — so
 * the arrival hook (`hooks/useHashArrival.ts`) and the scroll map share it and
 * `landing-address.test.ts` can pin it, including a source-scan guard that
 * every link into the home page's address space resolves here.
 */

export interface LandingAddress {
  /** The declared id (a `LANDING_SECTIONS` id). */
  id: string;
  /** Always in the DOM: the stage wrapper that receives the scroll first. */
  wrapperSelector: string;
  /** The id that marks the mounted section, present only once it has mounted:
   *  the section's own id or, where the wrapper owns the address id, the id of
   *  the heading the section is labelled by (see `LABELLED_INNER`). */
  innerId: string;
  /** Finds the mounted section INSIDE its wrapper. A descendant match, so a
   *  wrapper that repeats the section's id (`pricing`) is never mistaken for
   *  the mounted section. */
  innerSelector: string;
}

/** External wrapper ids -> the declared address they stand for. These are the
 *  `wrapperId`s in `app/page.tsx` that differ from their `anchorId`; links in
 *  the wild use them (`#download-section`, `#tools`), so both names resolve
 *  forever. The test fails if page.tsx grows a wrapper this table misses. */
const ALIASES: Readonly<Record<string, string>> = {
  "download-section": "download",
  tools: "use-cases",
  playground: "playground-split",
};

/** Declared ids whose mounted section renders a different id. */
const INNER_IDS: Readonly<Record<string, string>> = {
  pipelines: "orchestration-hub",
  vision: "vision-grid",
};

/** Addresses whose id the always-present wrapper owns (page.tsx `wrapperId`
 *  === `anchorId`). An id is unique per document, so the mounted section
 *  carries none and is found by the heading that labels it instead. */
const LABELLED_INNER: Readonly<Record<string, string>> = {
  "get-started": "get-started-heading",
};

const DECLARED = new Set(LANDING_SECTIONS.map((s) => s.id));

/** `#download`, `download`, `#download-section` -> the download address;
 *  anything else (`#features`, `#flow=...`, `#`) -> null, so hashes owned by
 *  other features are never hijacked. */
export function resolveLandingAddress(hash: string): LandingAddress | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const id = ALIASES[raw] ?? raw;
  if (!id || !DECLARED.has(id)) return null;
  if (id === "hero") {
    // SSR'd into the always-present `<div id="hero">` — wrapper and section are one.
    return { id, wrapperSelector: "#hero", innerId: "hero", innerSelector: "#hero" };
  }
  const wrapperSelector = `[data-scroll-anchor="${id}"]`;
  const labelledBy = LABELLED_INNER[id];
  if (labelledBy) {
    return { id, wrapperSelector, innerId: labelledBy, innerSelector: `${wrapperSelector} [aria-labelledby="${labelledBy}"]` };
  }
  const innerId = INNER_IDS[id] ?? id;
  return { id, wrapperSelector, innerId, innerSelector: `${wrapperSelector} #${innerId}` };
}

/* ── Arrival state machine ──────────────────────────────────────────
 *
 * seeking -> landed -> done        the section mounted; land, re-assert briefly
 * seeking -> cancelled             the reader scrolled: they are in charge now
 * seeking -> exhausted             the budget ran out (chunk never loaded)
 *
 * The hook ticks this table and performs the returned action; nothing here
 * touches the DOM. `elapsedMs` is time spent in the CURRENT state.
 */

export type ArrivalState = "seeking" | "landed" | "cancelled" | "exhausted" | "done";
export type ArrivalAction = "scroll-wrapper" | "scroll-inner-and-focus" | "reassert-inner" | "none";

export interface ArrivalInput {
  /** The real section is in the DOM inside its wrapper. */
  innerMounted: boolean;
  /** The READER expressed scroll intent (see `isUserScrollIntent`). The
   *  script's own scrollIntoView must never set this, or it cancels itself. */
  userScrolled: boolean;
  /** The target's document position moved since the last scroll we issued
   *  (a skeleton above or at the target swapped for the real section). */
  layoutShifted?: boolean;
  elapsedMs: number;
}

/** How long to wait for a gated chunk to load and mount. */
export const ARRIVAL_BUDGET_MS = 6000;
/** How long after landing to hold the section in place while the page settles. */
export const REASSERT_MS = 2500;

export function step(state: ArrivalState, input: ArrivalInput): { state: ArrivalState; action: ArrivalAction } {
  switch (state) {
    case "seeking":
      if (input.userScrolled) return { state: "cancelled", action: "none" };
      if (input.innerMounted) return { state: "landed", action: "scroll-inner-and-focus" };
      if (input.elapsedMs > ARRIVAL_BUDGET_MS) return { state: "exhausted", action: "none" };
      return { state: "seeking", action: "scroll-wrapper" };
    case "landed":
      if (input.userScrolled || input.elapsedMs > REASSERT_MS) return { state: "done", action: "none" };
      return { state: "landed", action: input.layoutShifted ? "reassert-inner" : "none" };
    default:
      return { state, action: "none" };
  }
}

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);

/** Whether an input event is the READER moving the page. `scroll` events are
 *  deliberately not intent: our own scrollIntoView fires them too, and an
 *  arrival that listened to them would cancel itself on its first scroll. */
export function isUserScrollIntent(event: { type: string; key?: string }): boolean {
  switch (event.type) {
    case "wheel":
    case "touchmove":
    case "pointerdown": // scrollbar drag, or the reader clicking into the page
      return true;
    case "keydown":
      return event.key !== undefined && SCROLL_KEYS.has(event.key);
    default:
      return false;
  }
}

/** The section's primary waitlist button pre-selects the visitor's own OS
 *  (as the navbar does) instead of always opening the Windows list. */
export function pickWaitlistPlatform<T extends { key: string }>(key: string, platforms: readonly T[]): T {
  return platforms.find((p) => p.key === key) ?? platforms[0];
}

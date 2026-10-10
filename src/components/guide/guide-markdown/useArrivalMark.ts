"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import { useStillMotion } from "@/hooks/useStillMotion";

/**
 * Search lands on the passage: after a body hit navigates to
 * `/guide/<cat>/<topic>#<section>`, mark the first match of the query inside
 * that section with the CSS Custom Highlight API.
 *
 * The highlight is a registry entry over a Range, not markup, so it never
 * touches the DOM React owns: no hydration risk, nothing to clean out of the
 * tree. The query travels from the search box through `armArrivalMark` (a
 * module-level hand-off that survives client navigation), never through the
 * URL, so a shared `#section` link stays a plain section link.
 *
 * The mark is static (`::highlight` cannot transition); the only motion is the
 * follow-up scroll that brings a match below the fold into view, which is
 * instant under reduced motion. The mark clears on the reader's next scroll
 * intent or keypress.
 */

const HIGHLIGHT = "guide-hit";
/** Reader-intent events. Never `scroll`: the hash landing and our own scroll fire that. */
const INTENT_EVENTS = ["wheel", "touchmove", "pointerdown", "keydown"] as const;
/** A hand-off older than this belongs to a navigation that never arrived. */
const HANDOFF_TTL_MS = 10_000;
/** The rendered markdown headings (HeadingAnchor) are the only h1-h4 carrying ids. */
const SECTION_HEADING = "h1[id], h2[id], h3[id], h4[id]";

type Handoff = { topicId: string; anchor: string; query: string; at: number };
let pending: Handoff | null = null;
const listeners = new Set<() => void>();

/** Search calls this right before it navigates to a body hit inside a section. */
export function armArrivalMark(topicId: string, anchor: string, query: string): void {
  pending = { topicId, anchor, query: query.trim(), at: Date.now() };
  listeners.forEach((notify) => notify());
}

function take(topicId: string): Handoff | null {
  if (!pending || pending.topicId !== topicId) return null;
  const handoff = pending;
  pending = null;
  return Date.now() - handoff.at <= HANDOFF_TTL_MS && handoff.query ? handoff : null;
}

/** The first case-insensitive match of `query` in the text between the section heading and the next one. */
function findInSection(root: HTMLElement, anchor: string, query: string): Range | null {
  const heading = document.getElementById(anchor);
  if (!heading || !root.contains(heading)) return null;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  walker.currentNode = heading;
  const nodes: Text[] = [];
  let text = "";
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (heading.contains(node)) continue;
    const owner = node.parentElement?.closest(SECTION_HEADING);
    if (owner && owner !== heading) break;
    nodes.push(node as Text);
    text += (node as Text).data;
  }
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (at === -1) return null;
  const range = document.createRange();
  let offset = 0;
  for (const node of nodes) {
    const end = offset + node.data.length;
    if (at >= offset && at < end) range.setStart(node, at - offset);
    if (at + query.length > offset && at + query.length <= end) {
      range.setEnd(node, at + query.length - offset);
      return range;
    }
    offset = end;
  }
  return null;
}

/**
 * Marks the search hit on arrival. `rootRef` is the rendered topic body.
 * Returns whether a mark is showing, for a polite screen-reader announcement
 * (a highlight is invisible to assistive tech).
 */
export function useArrivalMark(rootRef: RefObject<HTMLElement | null>, topicId: string): boolean {
  const still = useStillMotion();
  // Read at scroll time, so a preference that settles after mount never re-runs (and clears) the arrival.
  const stillRef = useRef(still);
  useEffect(() => {
    stillRef.current = still;
  }, [still]);
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    if (typeof CSS === "undefined" || !("highlights" in CSS)) return;
    let timer: number | undefined;
    let clear: (() => void) | null = null;

    const mark = () => {
      const handoff = take(topicId);
      const root = rootRef.current;
      if (!handoff || !root) return;
      clear?.();
      const range = findInSection(root, handoff.anchor, handoff.query);
      if (!range) return;
      CSS.highlights.set(HIGHLIGHT, new Highlight(range));
      setMarked(true);
      const box = range.getBoundingClientRect();
      if (box.top < 0 || box.bottom > window.innerHeight) {
        range.startContainer.parentElement?.scrollIntoView({ block: "center", behavior: stillRef.current ? "auto" : "smooth" });
      }
      const off = () => clear?.();
      // Attach after this task so the keypress or click that navigated here does not clear it.
      const attach = window.setTimeout(() => INTENT_EVENTS.forEach((e) => window.addEventListener(e, off, { passive: true })), 0);
      clear = () => {
        window.clearTimeout(attach);
        INTENT_EVENTS.forEach((e) => window.removeEventListener(e, off));
        CSS.highlights.delete(HIGHLIGHT);
        setMarked(false);
        clear = null;
      };
    };

    // Deferred a task: lets the router finish its hash landing (and, for a hash
    // change on this same topic, the push itself) before we measure.
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(mark, 0);
    };
    schedule();
    listeners.add(schedule);
    return () => {
      listeners.delete(schedule);
      window.clearTimeout(timer);
      clear?.();
    };
  }, [rootRef, topicId]);

  return marked;
}

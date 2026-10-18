/**
 * The refinement chat read as a game: each coach request opens a PLAY, which
 * runs until its config diff lands on the board; whatever follows the last
 * diff is the final whistle. Pure, derived from `CHAT_SCRIPT` - the script
 * stays the one source of what is said and when.
 */
import { CHAT_SCRIPT } from "../../../data";
import type { ChatMessageKey } from "../../../types";
import { labSectionCopy } from "@/i18n/pending/labSection";

export interface Segment {
  kind: "play" | "wrap";
  /** 1-based play number (wrap segments continue the count). */
  n: number;
  /** The coach's request that opened the play. */
  call: ChatMessageKey | null;
  /** Indices into CHAT_SCRIPT. */
  items: number[];
}

function buildSegments(): Segment[] {
  const out: Segment[] = [];
  let cur: Segment | undefined;
  let closed = false;
  CHAT_SCRIPT.forEach((m, i) => {
    if (m.role === "user") {
      cur = { kind: "play", n: out.length + 1, call: m.message, items: [i] };
      out.push(cur);
      closed = false;
      return;
    }
    if (!cur || closed) {
      cur = { kind: "wrap", n: out.length + 1, call: null, items: [i] };
      out.push(cur);
      closed = false;
      return;
    }
    cur.items.push(i);
    if (m.role === "diff") closed = true;
  });
  return out;
}

export const SEGMENTS = buildSegments();

export function segmentOf(item: number): number {
  const i = SEGMENTS.findIndex((s) => s.items.includes(item));
  return i < 0 ? 0 : i;
}

/** Step `at` reveals script item `at`: its scripted delay plus time to read the line before it. */
export function chatMs(at: number): number {
  if (at === 0) return 500;
  const prev = CHAT_SCRIPT[at - 1];
  const len = prev.role === "diff" ? prev.content.length : labSectionCopy.chat.messages[prev.message].length;
  return (CHAT_SCRIPT[at]?.delay ?? 0) + Math.min(2600, len * 13);
}

/**
 * The stat overlay's figures. They mirror the script's own lines (31% of the
 * last 200 runs in `tighten`, 9.2% on the 48h replay in `replayResult`, the
 * 8-12% benchmark) so the graphic and the dialogue say the same thing.
 */
export const URGENT_STAT = { before: 31, after: 9.2, benchLo: 8, benchHi: 12, scaleMax: 40 } as const;

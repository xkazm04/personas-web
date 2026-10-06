/* The v2 reading choreography, in story seconds (rate 1). The scripted bot
 * checks the message word by word against its keyword list; the agent reads
 * it part by part; then both say what they took from it and what happened. */

export const SCAN_FROM = 0.5;
export const SCAN_SPAN = 2.2;
export const READ_FROM = 0.7;
export const READ_SPAN = 2.0;
export const VERDICT_AT = 3.1;
export const OUTCOME_AT = 3.8;
export const STORY_LENGTH = 4.8;

export interface Word {
  text: string;
  key: boolean;
  /** When the scripted bot checks it. */
  at: number;
}

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Every word of the message in order, flagged where it is literally on the bot's keyword list. */
export function scanWords(segments: string[], keywords: string[]): Word[] {
  const flat = segments.flatMap((seg) => seg.split(" ").filter(Boolean).map((text) => ({ text, key: keywords.includes(norm(text)) })));
  const step = SCAN_SPAN / Math.max(1, flat.length);
  return flat.map((w, i) => ({ ...w, at: SCAN_FROM + i * step }));
}

/** When the agent reaches segment `i` of `n`. */
export const readAt = (i: number, n: number) => READ_FROM + (i * READ_SPAN) / Math.max(1, n);

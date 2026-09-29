/** The scrubbable week: one frame per beat. Pure data so the timeline can be stepped, played or dragged. */
export type DayState = "scheduled" | "running" | "first" | "failed" | "retrying" | "healed" | "ok";
export type StatusKey = "ready" | "first" | "running" | "failed" | "backoff" | "retrying" | "healed" | "writing" | "done";
export type Motion = "none" | "fwd" | "rev";

export interface Frame {
  day: number;
  time: string;
  status: StatusKey;
  motion: Motion;
  led: "off" | "on" | "bad" | "ok";
}

export const FRAMES: Frame[] = [
  { day: 0, time: "08:00", status: "ready", motion: "none", led: "off" },
  { day: 0, time: "08:00", status: "first", motion: "fwd", led: "on" },
  { day: 1, time: "08:00", status: "running", motion: "fwd", led: "on" },
  { day: 1, time: "08:00", status: "failed", motion: "none", led: "bad" },
  { day: 1, time: "08:01", status: "backoff", motion: "rev", led: "bad" },
  { day: 1, time: "08:02", status: "retrying", motion: "fwd", led: "on" },
  { day: 1, time: "08:02", status: "healed", motion: "none", led: "ok" },
  { day: 2, time: "08:00", status: "running", motion: "fwd", led: "on" },
  { day: 3, time: "08:00", status: "running", motion: "fwd", led: "on" },
  { day: 4, time: "08:00", status: "running", motion: "fwd", led: "on" },
  { day: 4, time: "08:00", status: "writing", motion: "none", led: "off" },
  { day: 4, time: "08:00", status: "done", motion: "none", led: "off" },
];
export const LAST = FRAMES.length - 1;
/** Frame from which the Overseer needle is up / the note is printed. */
export const HOT_AT = 10;
export const PRINT_AT = 11;

export function dayState(day: number, f: number): DayState {
  switch (day) {
    case 0:
      return f === 0 ? "scheduled" : f === 1 ? "running" : "first";
    case 1:
      if (f < 2) return "scheduled";
      if (f === 2) return "running";
      if (f <= 4) return "failed";
      return f === 5 ? "retrying" : "healed";
    default: {
      const start = day + 5;
      return f < start ? "scheduled" : f === start ? "running" : "ok";
    }
  }
}

export const DAY_LED: Record<DayState, "off" | "on" | "bad" | "ok"> = {
  scheduled: "off",
  running: "on",
  first: "ok",
  failed: "bad",
  retrying: "on",
  healed: "ok",
  ok: "ok",
};

/** Tape-pack fill (percent) for the two reels, from how many days have finished. */
export function packs(f: number): [number, number] {
  let done = 0;
  for (let d = 0; d < 5; d++) {
    const s = dayState(d, f);
    if (s === "first" || s === "healed" || s === "ok") done++;
  }
  return [92 - done * 9.2, 46 + done * 9.2];
}

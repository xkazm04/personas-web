/**
 * WHEN everything happens in "The Keys" (workshop lab v2).
 *
 *   plan     the walls draw themselves: your work, room by room.
 *   one      you hand her one key. It leaves your ring, crosses to its door,
 *            the door swings open and the room lights - and she is at work.
 *   more     two more keys, two more rooms; then a fourth. She works in all
 *            of them at once; how much she does grows with what you hand her.
 *   door     a finished fix needs the live site - a room whose key you kept.
 *            She walks to its door and stops. Nothing refuses her: the door
 *            is simply a wall, and it flares where she stands.
 *   note     the work slides out to your tray as a note: waits for you.
 *   settle   every room you opened finished; your two keys still on your ring.
 *
 * Room indices follow ./layout: 0 Code, 1 Docs, 2 Payments, 3 Tasks,
 * 4 Live site, 5 Team chat. Payments and Live site are the keys you keep.
 */

import type { Translations } from "@/i18n/en";

export const TICK_MS = 900;
/** 28 x 900ms = 25.2s per loop. */
export const CYCLE = 28;

const WALLS_AT = 1;
const NAMES_AT = 2;
const HER_AT = 3;
/** The tick each room's key is handed over; null = a key you keep. */
const KEY_AT: readonly (number | null)[] = [4, 8, null, 8, null, 12];
/** When each opened room's work lands - authored, never a neat sweep. */
const DONE_AT: readonly (number | null)[] = [13, 15, null, 16, null, 19];
/** Which job title each opened room carries (index into v2.jobs). */
export const JOB_OF: readonly (number | null)[] = [0, 1, null, 2, null, 3];
export const BRANDS = ["github", "notion", "stripe", "linear", "vercel", "slack"] as const;
/** The room whose key you kept and whose door she walks to. */
export const KEPT_DOOR = 4;

const WALK_AT = 15;
const STOP_AT = 17;
const NOTE_AT = 18;
const WAITS_AT = 19;
const CALM_AT = 21;

/** Reduced-motion frame: four rooms lit and finished, two keys still yours,
 *  her at the kept door, the note in your tray. */
export const STILL_TICK = CALM_AT + 2;

export type RoomState = "dark" | "keyed" | "open" | "working" | "done";

export interface Scene {
  walls: boolean;
  named: boolean;
  her: boolean;
  /** Index into layout.stations, or -1 for the entrance. */
  station: number;
  rooms: RoomState[];
  progress: number[];
  carrying: boolean;
  stopped: boolean;
  note: boolean;
  waits: boolean;
  working: boolean;
  calm: boolean;
  beat: number;
}

function roomAt(i: number, phase: number): RoomState {
  const key = KEY_AT[i];
  const done = DONE_AT[i];
  if (key === null || done === null || phase < key) return "dark";
  if (phase < key + 1) return "keyed";
  if (phase < key + 2) return "open";
  return phase < done ? "working" : "done";
}

function progressAt(i: number, phase: number): number {
  const key = KEY_AT[i];
  const done = DONE_AT[i];
  if (key === null || done === null) return 0;
  return Math.min(Math.max((phase - key - 2) / (done - key - 2), 0), 1);
}

/** Where she stands: she follows the newest open door, then the kept one. */
function stationAt(phase: number): number {
  if (phase >= WALK_AT) return KEPT_DOOR;
  if (phase >= 13) return 5;
  if (phase >= 9) return 1;
  if (phase >= 5) return 0;
  return -1;
}

const BEATS = [0, 4, 8, 12, WALK_AT, STOP_AT, NOTE_AT, CALM_AT];

export function sceneAt(phase: number): Scene {
  const rooms = KEY_AT.map((_, i) => roomAt(i, phase));
  return {
    walls: phase >= WALLS_AT,
    named: phase >= NAMES_AT,
    her: phase >= HER_AT,
    station: stationAt(phase),
    rooms,
    progress: KEY_AT.map((_, i) => progressAt(i, phase)),
    carrying: phase >= WALK_AT - 1 && phase < NOTE_AT,
    stopped: phase >= STOP_AT,
    note: phase >= NOTE_AT,
    waits: phase >= WAITS_AT,
    working: rooms.includes("working"),
    calm: phase >= CALM_AT,
    beat: BEATS.filter((b) => phase >= b).length - 1,
  };
}

type Copy = Translations["athenaLab"]["workshop"]["v2"];

export function statusAt(beat: number, c: Copy): [string, string] {
  return [c.status.full[beat], c.status.short[beat]];
}

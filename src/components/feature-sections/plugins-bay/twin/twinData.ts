import { TOOLS, TWIN_CHANNELS } from "../shared/catalog";

/**
 * The Twin scene's clock. One intent from you; the twin recalls who it is
 * for, then mirrors it into three channels at once, each in that channel's
 * tone; the replies come back one by one and are tracked. Beats:
 *
 *   0      the twin listens
 *   1      your intent arrives
 *   2      identity + memory recall light up
 *   3      tone per channel lights; three pulses leave together (the mirror)
 *   4      every channel is writing as you
 *   5-6    the three messages are out
 *   7-9    a reply returns per channel, each one tracked
 *   10-11  hold the full picture, then loop
 */
export const TWIN_CYCLE = 12;
/** Reduced motion / off screen: everything sent, every reply back. */
export const TWIN_STILL = 10;
export const REPLY_BEAT = 7;

export type ChannelKey = (typeof TWIN_CHANNELS)[number];

export const CHANNELS = TWIN_CHANNELS.map((key, i) => ({ key, tool: TOOLS[key], index: i }));

/**
 * Where each wire lands, as a % of the column height: the centres of three
 * equal cards with a 10px gap in a ~410px column.
 */
export const WIRE_Y = [15.8, 50, 84.2] as const;

export function twinAt(step: number) {
  const phase = step % TWIN_CYCLE;
  const replies = Math.max(0, Math.min(CHANNELS.length, phase - REPLY_BEAT + 1));
  return {
    phase,
    intent: phase >= 1,
    recalled: phase >= 2,
    toned: phase >= 3,
    sending: phase === 3,
    typing: phase === 4,
    sent: phase >= 5,
    /** How many channels have a reply back (in channel order). */
    replies,
    /** The channel whose reply is travelling home on this beat, if any. */
    returning: phase >= REPLY_BEAT && phase < REPLY_BEAT + CHANNELS.length ? phase - REPLY_BEAT : -1,
  };
}

export type TwinFrame = ReturnType<typeof twinAt>;

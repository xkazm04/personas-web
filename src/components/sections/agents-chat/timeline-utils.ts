import type { ChatMessage, ChatScenario } from "./types";

export type RaceChannel = "workflow" | "agent";

/** How a lane renders inside a given merged-transcript row. */
export type LaneState = "through" | "end" | "none";

export interface RaceRow {
  key: string;
  channel: RaceChannel;
  msg: ChatMessage;
  /** Index of the message within its own channel (drives reveal gating). */
  channelIndex: number;
  /** Parsed timestamp in seconds (drives chronological merge order). */
  seconds: number;
  isLastOfChannel: boolean;
}

/** Parse a "m:ss" transcript timestamp into seconds. */
export function parseClock(timestamp: string): number {
  const [minutes, secondsPart] = timestamp.split(":");
  return (Number(minutes) || 0) * 60 + (Number(secondsPart) || 0);
}

/** Seconds elapsed at the final message of a channel (0 when empty). */
export function lastSeconds(messages: ChatMessage[]): number {
  const last = messages.at(-1);
  return last ? parseClock(last.timestamp) : 0;
}

/**
 * Merge both channels into one chronologically sorted transcript.
 * Ties resolve to the workflow channel first so the slower system
 * reads above the agent at identical timestamps.
 */
export function buildRaceRows(scenario: ChatScenario): RaceRow[] {
  const rows: RaceRow[] = [];
  const push = (channel: RaceChannel, messages: ChatMessage[]) => {
    messages.forEach((msg, i) => {
      rows.push({
        key: `${channel}-${i}`,
        channel,
        msg,
        channelIndex: i,
        seconds: parseClock(msg.timestamp),
        isLastOfChannel: i === messages.length - 1,
      });
    });
  };
  push("workflow", scenario.workflow.messages);
  push("agent", scenario.agent.messages);
  rows.sort(
    (a, b) =>
      a.seconds - b.seconds ||
      a.channelIndex - b.channelIndex ||
      (a.channel === b.channel ? 0 : a.channel === "workflow" ? -1 : 1),
  );
  return rows;
}

/** Last merged-row index belonging to a channel (-1 when the channel is empty). */
export function lastRowIndexOf(rows: RaceRow[], channel: RaceChannel): number {
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].channel === channel) return i;
  }
  return -1;
}

/** Lane rendering state for a row: continues through, terminates here, or absent. */
export function laneStateAt(rowIndex: number, lastIndex: number): LaneState {
  if (lastIndex < 0 || rowIndex > lastIndex) return "none";
  return rowIndex === lastIndex ? "end" : "through";
}

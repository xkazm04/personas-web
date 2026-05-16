export type EventType =
  | "execution.completed"
  | "execution.started"
  | "message.sent"
  | "event.emitted"
  | "memory.stored"
  | "review.requested"
  | "knowledge.indexed"
  | "health.checked";

export interface Pulse {
  id: string;
  eventType: EventType;
  duration: number;
  cost: number;
  ts: number;
}

export type Stats = Record<
  string,
  { pulses: Pulse[]; durations: number[]; totalCost: number; pulseCount: number }
>;

export const MAX_PULSES_PER_AGENT = 6;
export const MAX_SPARKLINE = 12;

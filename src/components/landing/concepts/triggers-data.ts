/** The ten detents of the selector, in knob order (clockwise from lower left). */
export const TRIGGER_KEYS = [
  "manual", "schedule", "polling", "webhook", "event",
  "file", "clipboard", "focus", "chain", "composite",
] as const;
export type TriggerKey = (typeof TRIGGER_KEYS)[number];

/** Initial (finished-frame) detent: App focus. */
export const TRIGGER_DEFAULT = 7;

/** Vertical position (percent of the stage) of each label; five per side. */
export const LABEL_Y = [55, 45, 35, 25, 15, 15, 25, 35, 45, 55];

export const LEADS = [
  "M135 137.3L130 132H102", "M115.3 116.4L107 108H102", "M110.3 88.2L106 84H102",
  "M121.7 61.9L120 60H102", "M145.7 46.1L136 36H102", "M174.3 46.1L184 36H218",
  "M198.3 61.9L200 60H218", "M209.7 88.2L214 84H218", "M204.7 116.4L213 108H218",
  "M185 137.3L190 132H218",
];

export const TICKS = [
  "M139.5 129.5L136.5 134.7", "M123.4 112.4L118 115.1", "M119.3 89.2L113.3 88.5",
  "M128.6 67.6L124 63.8", "M148.2 54.7L146.5 49", "M171.8 54.7L173.5 49",
  "M191.4 67.6L196 63.8", "M200.7 89.2L206.7 88.5", "M196.6 112.4L202 115.1",
  "M180.5 129.5L183.5 134.7",
];

export const knobAngle = (i: number) => -150 + (i * 100) / 3;

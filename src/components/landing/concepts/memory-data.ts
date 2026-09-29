/** Geometry for the memory figure (viewBox 320 x 240). */
export const RUN1_PATH =
  "M30 76H74C96 76 104 50 90 42C76 34 62 58 80 66C98 74 108 100 128 98C150 96 150 62 134 60C118 58 126 90 152 90H182C204 90 206 56 222 56C240 56 230 102 248 102C264 102 256 76 268 76H290";

/** Where the two snags sit along run 01's path, as a fraction of its length. */
export const SNAGS = [0.25, 0.715];

/** Memory cues: x, the y they sit at on run 01, and how far they drop to run 12's tape. */
export const CUES = [
  { x: 52, y: 76, dy: 120 },
  { x: 167, y: 90, dy: 106 },
  { x: 279, y: 76, dy: 120 },
];

/** Tape splices on run 12's tape. */
export const JOIN_X = [107, 222];

export const HEAD1_END: [number, number] = [290, 76];
export const HEAD2_START = 30;
export const HEAD2_END: [number, number] = [290, 196];

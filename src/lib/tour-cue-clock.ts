/**
 * Narration-bound cue clock for the guided tour.
 *
 * In-step cues (`TourAction.atMs`, `TourSpotlightCue.atMs`) used to be
 * `setTimeout`s armed at step entry, so pausing the voice, a slow audio start
 * or a mid-clip re-buffer left the picture running ahead of the words. This is
 * the pure core of the replacement: a cue fires when the step's *clock* passes
 * its `atMs`, and the clock only advances while the tour is playing.
 *
 * - A step with narration is clocked by the audio element's own `currentTime`
 *   (frozen while paused or buffering, 0 until the first sample plays).
 * - A silent step (or one whose clip errored) uses a virtual clock that
 *   accumulates real elapsed time, but only while `playing`.
 *
 * Kept free of React and the DOM so it can be unit-tested in the node runner.
 */

export interface TourCue {
  /** Step-clock time (ms) at which the cue fires. */
  atMs: number;
  fire: () => void;
}

export interface TourClockSample {
  /** The tour is playing (not paused by the visitor). */
  playing: boolean;
  /** Wall-clock timestamp of this sample (rAF time), ms. */
  nowMs: number;
  /**
   * The narration clock in ms, or `null` when the step has no usable audio
   * (silent step, or the clip errored) and the virtual clock should drive.
   */
  audioMs: number | null;
}

export class TourCueClock {
  private virtualMs = 0;
  private lastNowMs: number | null = null;
  private readonly fired: boolean[];

  constructor(private readonly cues: readonly TourCue[]) {
    this.fired = cues.map(() => false);
  }

  /** Current step-clock reading after the last `tick`, in ms. */
  get elapsedMs(): number {
    return this.virtualMs;
  }

  /** Advance the clock by one sample and fire every cue that is now due. */
  tick({ playing, nowMs, audioMs }: TourClockSample): void {
    const dt = this.lastNowMs === null ? 0 : Math.max(0, nowMs - this.lastNowMs);
    this.lastNowMs = nowMs;
    if (audioMs !== null) {
      this.virtualMs = audioMs;
    } else if (playing) {
      this.virtualMs += dt;
    }
    // A paused tour must not fire anything, even if the audio clock already
    // sits past a cue (e.g. the visitor paused between two samples).
    if (!playing) return;
    for (let i = 0; i < this.cues.length; i++) {
      if (!this.fired[i] && this.virtualMs >= this.cues[i].atMs) {
        this.fired[i] = true;
        this.cues[i].fire();
      }
    }
  }
}

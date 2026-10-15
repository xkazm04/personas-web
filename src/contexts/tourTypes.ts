import type { TourStep } from "@/lib/tour-script";
import type { ShiftTally } from "@/lib/tour-progress";

/** Translated copy for the end-of-tour bridge prompt. */
export interface TourBridgeStrings {
  prompt: string;
  confirm: string;
  dismiss: string;
}

/** Options for a tour run. */
export interface TourStartOptions {
  /** Finishing the last step navigates here (e.g. "/features?tour=1"). */
  bridgeHref?: string;
  /** Per-tour bridge copy; falls back to t.tour defaults when unset. */
  bridge?: TourBridgeStrings;
  /** Show the welcome intro pop-up before the first step. */
  intro?: boolean;
}

/** The end of a tour the visitor finished by acting: what they did, and where it led. */
export interface TourRecap extends ShiftTally {
  /** The tour opened the run the visitor's last action was about. */
  openedRun: boolean;
}

/** What `useTour()` hands to the tour overlay and its launchers. */
export interface TourContextValue {
  /** Whether the tour overlay is mounted. */
  active: boolean;
  /** Steps array of the currently-running script. */
  steps: TourStep[];
  /** Index into `steps` of the current step. */
  stepIndex: number;
  /** Selector the spotlight is currently tracking (follows in-step sweeps). */
  activeSpotlight: string | null;
  /** Whether auto-advance is running. */
  playing: boolean;
  /** Whether the end-of-tour bridge prompt is showing. */
  atBridge: boolean;
  /** Whether the welcome intro pop-up is showing (before step 0). */
  atIntro: boolean;
  /** The recap of a tour the visitor finished by acting; null otherwise. */
  recap: TourRecap | null;
  audioAnalyser: AnalyserNode | null;
  /** Narration output level (0..1). Persists via localStorage. */
  volume: number;
  setVolume: (value: number) => void;
  /** Per-tour bridge copy override; null = use the t.tour defaults. */
  bridge: TourBridgeStrings | null;
  start: (steps: TourStep[], options?: TourStartOptions) => void;
  exit: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  togglePlay: () => void;
  beginTour: () => void;
  confirmBridge: () => void;
  dismissBridge: () => void;
  /** Play the current step's demonstration (its `actions`) instead of doing it yourself. */
  showMe: () => void;
}

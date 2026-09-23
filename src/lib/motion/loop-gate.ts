/**
 * The loop gate: ONE answer to "may this ambient loop run right now?",
 * merged from a closed, written-down list of deciders.
 *
 * Deciders (each is a veto; the merge is a disjunction - a loop runs only
 * when nobody objects):
 *   - "preference" - the visitor asked for reduced motion.
 *   - "foreground" - the tab is backgrounded.
 *   - "in-view"    - the surface is scrolled out of view. `null` means no
 *                    observer has answered (no ref, no IntersectionObserver):
 *                    this decider then ABSTAINS - the partial-merge fallback,
 *                    so a stray mount keeps running while preference and
 *                    foreground, which are globally readable, keep vetoing.
 *   - "user"       - the visitor pressed a stop control. Open-ended: only the
 *                    visitor lifts it.
 *
 * This module is pure and has no React; `useLoopGate` (src/hooks/useLoopGate.ts)
 * feeds it from the live primitives - `useStillMotion`, `usePageVisibility`,
 * `useIsVisible`. It is deliberately NOT a coordinator: no provider, no store,
 * no registry. Each consumer computes its own verdict from those primitives.
 */

export const LOOP_DECIDERS = ["preference", "foreground", "in-view", "user"] as const;

export type LoopDecider = (typeof LOOP_DECIDERS)[number];

export interface LoopInputs {
  /** prefers-reduced-motion is set. */
  stillPreferred: boolean;
  /** document.hidden. */
  tabHidden: boolean;
  /** Surface intersects the viewport; `null` = unknown, abstains. */
  inView: boolean | null;
  /** The visitor stopped this loop with a control. */
  userStopped?: boolean;
}

export interface LoopVerdict {
  run: boolean;
  /** The deciders that objected, in `LOOP_DECIDERS` order - "why is this still?" */
  vetoedBy: LoopDecider[];
}

function objections(inputs: LoopInputs): Record<LoopDecider, boolean> {
  return {
    preference: inputs.stillPreferred,
    foreground: inputs.tabHidden,
    "in-view": inputs.inView === false,
    user: inputs.userStopped === true,
  };
}

function merge(votes: Record<LoopDecider, boolean>, abstaining: readonly LoopDecider[]): LoopVerdict {
  const vetoedBy = LOOP_DECIDERS.filter((d) => !abstaining.includes(d) && votes[d]);
  return { run: vetoedBy.length === 0, vetoedBy };
}

/** Verdict for a decorative motion loop: every decider may veto. */
export function resolveLoop(inputs: LoopInputs): LoopVerdict {
  return merge(objections(inputs), []);
}

/**
 * Verdict for a DATA feed (a ticker that refreshes numbers, not a movement).
 * Reduced motion is about movement, so "preference" abstains: a reduced-motion
 * visitor still gets live figures, but nobody pays for them while the tab is
 * hidden or the panel is scrolled past.
 */
export function resolveTicker(inputs: LoopInputs): LoopVerdict {
  return merge(objections(inputs), ["preference"]);
}

/**
 * The timing fields of a framer transition that a loop spec may carry. Kept
 * framer-free so this module stays pure; `loopTransition` is generic with a
 * `const` parameter so an `ease` literal survives into framer's `Easing` type.
 */
export interface LoopSpec {
  duration?: number;
  ease?: string;
  delay?: number;
  repeatDelay?: number;
}

/** A stopped loop: no repeat, and it reaches its rest pose at once. */
export interface RestTransition {
  duration: 0;
  repeat: 0;
}

/**
 * The only place an infinite repeat is written for the visualizers. Running:
 * the spec repeats forever. Stopped: it settles at rest immediately - an
 * infinite loop reduces to stillness, never to a slower loop. Pair it with an
 * `animate` target that is the loop's keyframes when running and the rest
 * pose when stopped, so the element (and the DOM shape) stays the same.
 */
export function loopTransition<const S extends LoopSpec>(
  run: boolean,
  spec: S,
): (S & { repeat: number }) | RestTransition {
  return run ? { ...spec, repeat: Infinity } : { duration: 0, repeat: 0 };
}

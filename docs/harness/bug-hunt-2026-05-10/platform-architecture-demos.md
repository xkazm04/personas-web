# Bug Hunter — Platform Architecture Demos

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 6 files (in-scope) + 3 closely-related files (`use-terminal-sequence.ts`, `index.tsx` for platform-command, `useAutoCycle.ts`) needed to reason about race conditions
> Date: 2026-05-10

The Platform Command terminal demo is the dominant source of latent failures in
this scope: a 4-effect timer state machine with a single `timeoutRef` shared
between typing, output, summary, and "done" phases. Most issues below trace to
this single shared slot or to the demo not respecting page/section visibility.
The Orchestration Hub fares better thanks to `useAutoCycle`, but inherits one
ordering pitfall on rapid clicks.

---

## 1. Phase-change effects leak the previous timer (single-slot timeoutRef)

- **Severity**: High
- **Category**: Race condition / resource leak
- **File**: `src/components/sections/platform-command/use-terminal-sequence.ts:78-114, 171-198, 201-214`
- **Scenario**:
  1. Section enters viewport → `idle → typing` warm-up `setTimeout(600ms)` is
     stored in `timeoutRef.current`.
  2. While that 600 ms timer is still pending, the user scrolls the terminal
     out of view, then back in fast enough that React re-runs the warm-up
     effect again (or `phase === "typing"` is reached by another path).
  3. `timeoutRef.current = setTimeout(...)` overwrites the slot; the *first*
     timer is now orphaned. It fires in the background, calls
     `setPhase("typing")` (gated only by `isActiveRef.current`, which is still
     `true`), and the typing loop double-starts: two pending typing timers
     interleave `setTypedText(fullText.slice(0, n+1))`, producing visible
     "judder" or skipped characters.
  4. The same pattern repeats on every effect: typing→output, output→typing,
     summary→done, done→restart. None of the four `useEffect`s return a
     cleanup that clears `timeoutRef.current` before the next effect run.
- **Root cause**: A single `useRef` slot is mutated from four independent
  effect bodies and three callbacks. Whoever writes last wins, and the
  previous handle is unreachable. Only `skipCommand` and `restart` call
  `clearTimeout` on the slot before mutating, so anything else (StrictMode
  double-invoke, dep change, re-mount) leaks.
- **Impact**: Glitchy typing, duplicated lines on rapid view/scroll, and (in
  React 19 StrictMode dev) every effect runs twice during dev so the bug is
  reproducible on first load.
- **Fix sketch**: Use a `useRef<Set<Timeout>>()` or, preferably, return a
  cleanup `() => { if (t) clearTimeout(t); }` from each effect that captures
  *its own* local timer:
  ```ts
  useEffect(() => {
    if (phase !== "typing") return;
    const t = setTimeout(...);
    return () => clearTimeout(t);
  }, [phase, typedText, currentCommandIndex, prefersReducedMotion]);
  ```
  Drop the shared `timeoutRef` entirely; let `skipCommand`/`restart`
  propagate via `setPhase` and rely on each effect's own cleanup.

---

## 2. Sequence keeps running while tab hidden or section scrolled away

- **Severity**: High
- **Category**: Animation/visibility-pause assumption
- **File**: `src/components/sections/platform-command/use-terminal-sequence.ts:54-55, 201-214`
- **Scenario**:
  - `useInView(terminalRef, { once: false, margin: "-100px" })` only gates
    the *initial* `idle → typing` transition (line 79: `if (isInView && phase
    === "idle")`). Once the machine is past `"idle"`, `isInView` is never
    consulted again. Scrolling the terminal off-screen does **not** pause it.
  - There is no `usePageVisibility` integration. When the user switches tabs:
    setTimeout chains keep advancing the state machine, framer-motion mount
    transitions for new lines keep firing, and after the full 4-command +
    summary + 4 s wait cycle (~30 s+) the loop quietly restarts via
    `restart()` and types out the entire sequence again.
  - For the marketing landing page, this is the single most expensive
    component on the page that is not gated.
- **Root cause**: `phase === "idle"` is the only viewport gate; subsequent
  phases self-loop via setTimeout without rechecking `isInView` or
  `document.hidden`. The hook explicitly *has* a `usePageVisibility`
  available (`src/hooks/usePageVisibility.ts`) that the rest of the codebase
  uses to pause animations — it is not wired up here.
- **Impact**: Battery drain on mobile (a backgrounded tab keeps the
  re-render loop alive), unnecessary restarts the user never sees, and on
  slow devices the sequence can be mid-output when the user finally scrolls
  back, breaking the "tap into a fresh demo" feel.
- **Fix sketch**: Treat `!isInView || pageHidden` as a hard pause — either
  guard the entry of every phase effect with `if (!isInView) return;`, or
  better, gate `setPhase` transitions on a derived `shouldRun` boolean and
  defer the in-flight `setTimeout` while paused. At minimum, suppress the
  4 s `restart()` chain when the section is off-screen.

---

## 3. Rapid Skip clicks duplicate history entries

- **Severity**: Medium
- **Category**: Race condition (state-batching)
- **File**: `src/components/sections/platform-command/use-terminal-sequence.ts:139-157`
- **Scenario**:
  - `skipCommand` reads `currentCommandIndex` from closure, pushes
    `{ command: cmd.command, output: cmd.output }` into history, then calls
    `setCurrentCommandIndex(prev => prev + 1)`.
  - If the user clicks Skip twice within the same React batch (very plausible
    with framer-motion's eager click-through, double-click, or accidental
    double-tap on touch), both invocations close over the *same* old
    `currentCommandIndex`. Both push the *same* `cmd.output` into history;
    only the functional `setCurrentCommandIndex` advances correctly, so the
    list ends up with `[cmd0, cmd0, cmd2, cmd3]` — `cmd1` is silently
    skipped.
- **Root cause**: `setHistory(prev => [...prev, snapshot])` uses a snapshot
  built from a stale closure value; the functional form is only used for the
  index. The two updates are not consistent under batching.
- **Impact**: Visible duplicate command + missing pillar in the
  CompletedCount badge, hard-to-reproduce intermittently, looks like a
  display glitch.
- **Fix sketch**: Build the snapshot inside the functional updater:
  ```ts
  setCurrentCommandIndex((idx) => {
    setHistory((prev) => [...prev, { command: commands[idx].command, output: commands[idx].output }]);
    return idx < commands.length - 1 ? idx + 1 : idx;
  });
  ```
  …or guard at the top of `skipCommand` with `if (phase !== "typing" && phase !== "output") return;` and disable the button while a transition is in flight.

---

## 4. `advanceToNext` snapshots stale `outputLines` after Skip

- **Severity**: Medium
- **Category**: Stale closure / silent failure
- **File**: `src/components/sections/platform-command/use-terminal-sequence.ts:119-136`
- **Scenario**:
  - `advanceToNext` is memoised with deps `[currentCommandIndex, outputLines]`.
  - After `skipCommand` runs, it sets `outputLines = []` and bumps
    `currentCommandIndex`. The next render produces a fresh
    `advanceToNext` — fine.
  - But the existing **output-phase effect** at line 188 captures the
    *previous* `advanceToNext` because the effect dep array includes it. If
    the skip happens at the exact moment the per-line setTimeout fires,
    `advanceToNext` runs with the captured `outputLines` from before the
    skip — pushing already-displayed lines into history a second time, while
    the skip already added the canonical `cmd.output` for that command.
- **Root cause**: Two paths can write to `history` for the same command
  (Skip and natural completion), and they don't coordinate via a "did I
  already commit this command?" flag. Plus `outputLines` is in the dep
  array, which means the captured `advanceToNext` differs each render.
- **Impact**: Silent. Most users never see it; on slow machines or in dev
  StrictMode you'll see a duplicated row in the scroll-back history.
- **Fix sketch**: Add a ref `committedCommands = useRef(new Set<number>())`
  that gates `setHistory` on a per-index basis, or merge `skipCommand` /
  `advanceToNext` into a single `advance(reason: "skip" | "done")` reducer
  action.

---

## 5. Empty `commands` / `TRIGGERS` array crashes the demo

- **Severity**: Medium
- **Category**: Edge case (empty data)
- **File**:
  - `src/components/sections/platform-command/components/TerminalControls.tsx:24-29`
  - `src/components/sections/orchestration-hub/index.tsx:29`
- **Scenario**:
  - In `TerminalControls`, `currentCmd = commands[currentCommandIndex]` is
    accessed; the JSX uses `currentCmd?.pillar ?? ""`, but `badgeLabel`
    builds `${completedCount + 1}/${commands.length} ${currentCmd?.pillar
    ?? ""}` — when `commands` is empty, that renders "1/0 " forever, and
    `useTerminalSequence` enters a loop where `currentCommandIndex < commands
    .length - 1` is always false, so the warm-up immediately falls into
    `setPhase("summary")` after a 600 ms typing attempt that does nothing.
    Visible as a permanently-empty terminal.
  - Orchestration Hub: `const activeTrigger = TRIGGERS[active] ?? TRIGGERS[0]`
    falls back to `TRIGGERS[0]`, but if the list is empty, `TRIGGERS[0]` is
    `undefined` and `activeTrigger.id` on line 68 throws
    `Cannot read properties of undefined (reading 'id')`.
- **Root cause**: Neither component asserts `data.length > 0`; the data
  arrays are imported as static modules so today they're always non-empty,
  but a future CMS-backed source (or accidentally commenting out triggers
  during a refactor) breaks the page.
- **Impact**: Silent UI failure (terminal) or hard crash (hub) — same data
  contract, different blast radius.
- **Fix sketch**: Early-return `null` from both components when their
  source list is empty, and add a tiny dev-only `console.warn` so the
  emptiness is loud rather than silent.

---

## 6. `useAutoCycle.pauseFor` swallowed by quick re-hover

- **Severity**: Medium
- **Category**: Race condition / UX-affecting
- **File**:
  - `src/hooks/useAutoCycle.ts:94-110`
  - `src/components/sections/orchestration-hub/index.tsx:31-40, 65-66`
- **Scenario**:
  1. User hovers a node → `setHovering(true)` → `paused = true`.
  2. User clicks the node → `handleSelect` calls `pauseFor(TAP_PAUSE_MS)`.
     This sets `internalPaused = true` and schedules a 19 200 ms resume
     timer.
  3. User moves the mouse off the hub → `setHovering(false)`. The cycle is
     still paused because `internalPaused` is `true`.
  4. After 19 200 ms the timer fires → `setInternalPaused(false)` → cycle
     resumes. Fine.
  5. **But**: if step 3 happens *and the user moves back over the hub
     within 19 200 ms*, `paused = true` again (hover) then `paused = false`
     (mouse-leave) does nothing. The user's expectation is "I left the
     hover, the cycle should be running again immediately" — instead it's
     dead until the unrelated tap-pause timer expires.
  6. Likewise, calling `setPaused(false)` *after* a `pauseFor` does **not**
     clear the resume timer (line 94-100 only clears it when the new value
     is set as the internal flag, but it does so unconditionally — actually
     reading more carefully, `setPaused` always clears the timer, but that's
     only invoked if the consumer calls `setPaused`. Hover uses the
     external `paused` prop, which never touches `internalPaused` — so the
     hover/leave path can never short-circuit a `pauseFor` timer).
- **Root cause**: `internalPaused` and the external `paused` prop are
  ORed together but their lifecycles are independent. `pauseFor` has no
  hook-back into hover state; once armed, only its own timer or
  `setPaused(...)` can disarm it.
- **Impact**: After tapping a node, the cycle feels "stuck" for ~19 s even
  if the user has clearly moved on. Marketing-side: less of the "pick a
  trigger to see it fire" promise (the eight-trigger reveal) actually
  rotates.
- **Fix sketch**: Either (a) shorten `TAP_PAUSE_MS` (currently
  `AUTO_CYCLE_MS * 2 = 19.2 s`, far too long — 6-8 s is plenty), or (b)
  cancel the `pauseFor` timer when `paused` (the external prop) transitions
  `true → false`, since hover-leave is the natural "I'm done reading"
  signal. The hook already exposes `setPaused`; add a `cancelPauseFor`
  return value and call it in the hub's `onPointerLeave`.

---

## 7. `outputLines` rendered with index keys + AnimatePresence — exit animations break on Skip/Restart

- **Severity**: Low
- **Category**: Latent failure (animation correctness)
- **File**: `src/components/sections/platform-command/index.tsx:118-128`
- **Scenario**:
  - `<AnimatePresence>` wraps a `.map((line, lIdx) => <TerminalLine key={lIdx} />)`.
  - On `skipCommand`, `outputLines` is cleared *and* `currentCommandIndex` is
    bumped — the AnimatePresence sees the same `lIdx` keys (0…n) refer to
    different content next render. It will not run exit animations on the
    old lines and will not run enter animations on the new ones; instead it
    visually swaps content in place mid-frame.
  - Special-character lines (e.g. the box-drawing characters in command 2:
    `│ Email │ ──► │ Slack│`) inherit no `whitespace: pre` (only the summary
    block applies it on line 144). If `TerminalLine` doesn't preserve
    leading spaces, the ASCII boxes collapse and look broken.
- **Root cause**: Index keys are not stable identity for animated lists,
  and the rendering relies on `TerminalLine` (out of scope) doing the right
  thing for whitespace.
- **Impact**: Visible "snap" instead of fade on skip; possibly broken ASCII
  layout depending on `TerminalLine`'s CSS.
- **Fix sketch**: Use a stable composite key `${currentCommandIndex}-${lIdx}`
  so AnimatePresence sees a fresh keyset across command transitions, and
  apply `style={{ whiteSpace: "pre" }}` to `TerminalLine` (or wrap output
  lines in a `<pre>` ancestor) to guarantee box-drawing layout.

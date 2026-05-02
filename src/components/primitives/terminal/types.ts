/**
 * Shared cell shape for terminal-style demos. Adopted by:
 *   - platform-command (CLI showcase)
 *   - playground TerminalSim
 *   - any future "agent terminal" surface
 *
 * `color` is intentionally an open `string` so each consumer can use its
 * own narrower union (e.g. "cyan" | "emerald" | "info" | "command") and
 * provide a matching colorClasses Record at render time. This lets the
 * primitive stay portable without forcing all consumers onto one palette.
 */
export interface TerminalOutputLine {
  text: string;
  /** Color token; the consumer maps this to a Tailwind class via colorClasses. */
  color: string;
  /** Indent level. TerminalLine multiplies by indentPx (default 8). */
  indent?: number;
  /** Optional per-line additional delay in ms (consumer-defined semantics). */
  delay?: number;
}

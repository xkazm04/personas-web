import type { BrandKey } from "@/lib/brand-theme";

/*
 * The failures the healing lab dramatises, each with the remedy the desktop
 * app really applies (personas core/src/healing.rs, 2026-10):
 *   rate limit   -> RetryWithBackoff, 30 s doubling per consecutive failure, max 5 min
 *   timeout      -> RetryWithTimeout, twice the time limit (capped)
 *   overloaded   -> RetryAt now + 10/20/30 min, RESUMES the session mid-run
 *   broken setup -> AiHealing: the session is resumed on Claude Opus with the error
 *   credential   -> CreateIssue, never retried: a person must renew the login
 * Every retryable category escalates to an issue after 3 retries (MAX_RETRY_COUNT).
 * Words live in en.ts `featuresSections.healing.cases`.
 */

export type CaseId = "rateLimit" | "timeout" | "overload" | "setup" | "login";

export const CASE_IDS: readonly CaseId[] = ["rateLimit", "timeout", "overload", "setup", "login"];

export const CASE_COLOR: Record<CaseId, BrandKey> = {
  rateLimit: "amber",
  timeout: "cyan",
  overload: "purple",
  setup: "blue",
  login: "rose",
};

/** The one failure no retry fixes. */
export const isEscalated = (id: CaseId) => id === "login";

/** Real connector glyphs from public/tools. */
export const TOOL_ICON = {
  gmail: "/tools/gmail.svg",
  slack: "/tools/slack.svg",
  notion: "/tools/notion.svg",
} as const;

export const fill = (s: string, n: number | string) => s.replace("{n}", String(n));

/**
 * The phone -> computer hand-off as one pure machine, shared by /m (hive) and /m2 (clock).
 *
 *   IDLE --submit--> BUSY(token) --result(token)--> SENT | IDLE(+error | +manual)
 *
 * - The route per platform (share the link vs join the waitlist) comes from the release authority
 *   (`downloadPlan` in src/lib/release.ts), never from a platform literal: a platform is "share"
 *   only when its installer is live. The day macOS gets a URL, the phones follow without an edit.
 * - A submit while BUSY is refused here, not on a button, so Enter in the email field cannot post
 *   twice.
 * - Every submission carries a token; a result whose token is not the BUSY one is dropped, so a
 *   platform switch mid-flight can never land "joined macOS" on the Linux selection.
 *
 * `reduce` returns [state, effect]; the page hooks run the effect (share sheet, POST) and feed the
 * outcome back as a `result` event. `view` derives what the dock, hint line and email field show.
 */
import { DOWNLOAD_PLAN, type DownloadPlan, type ReleasePlatform } from "@/lib/release";
import { EMAIL_RE } from "@/components/waitlist-modal/waitlistUtils";
import type { WaitlistErrorCode } from "./submitWaitlist";

export type HandoffPlatform = ReleasePlatform;
export type HandoffRoute = "share" | "waitlist";
export type HandoffRoutes = Record<HandoffPlatform, HandoffRoute>;
export type SentKind = "shared" | "copied" | "joined" | "already";
export type HandoffError = WaitlistErrorCode | "invalid";

interface Base {
  platform: HandoffPlatform;
  route: HandoffRoute;
  /** The last submission's id; monotonic for the life of the page. */
  token: number;
}
export type HandoffState =
  | (Base & { phase: "idle"; error: HandoffError | null; manual: boolean })
  | (Base & { phase: "busy" })
  | (Base & { phase: "sent"; kind: SentKind });

export type HandoffOutcome = "shared" | "copied" | "joined" | "duplicate" | "cancelled" | "manual" | "aborted" | "error";

export type HandoffEvent =
  | { type: "platform"; platform: HandoffPlatform }
  | { type: "submit"; email?: string }
  | { type: "result"; token: number; outcome: HandoffOutcome; code?: HandoffError }
  /** The email field changed: a finished or failed submission returns to idle. */
  | { type: "edit" }
  /** Copy-link failed outside a submission: show the link for copying by hand. */
  | { type: "manual" };

export type HandoffEffect =
  | { kind: "share"; token: number }
  | { kind: "post"; token: number; email: string; platform: HandoffPlatform }
  | { kind: "focus" };

/** share where the release authority has a live installer, the waitlist everywhere else. */
export function handoffRoutes(plan: DownloadPlan): HandoffRoutes {
  const route = (p: HandoffPlatform): HandoffRoute => (plan.platforms[p] === "download" ? "share" : "waitlist");
  return { windows: route("windows"), macos: route("macos"), linux: route("linux") };
}

/** The routes for this build. */
export const BUILD_ROUTES: HandoffRoutes = handoffRoutes(DOWNLOAD_PLAN);

export function initialHandoff(routes: HandoffRoutes = BUILD_ROUTES, platform: HandoffPlatform = "windows"): HandoffState {
  return { phase: "idle", platform, route: routes[platform], token: 0, error: null, manual: false };
}

const idle = (s: HandoffState, extra: { error?: HandoffError | null; manual?: boolean } = {}): HandoffState => ({
  phase: "idle",
  platform: s.platform,
  route: s.route,
  token: s.token,
  error: extra.error ?? null,
  manual: extra.manual ?? false,
});

export function reduce(state: HandoffState, event: HandoffEvent, routes: HandoffRoutes = BUILD_ROUTES): [HandoffState, HandoffEffect | null] {
  switch (event.type) {
    case "platform":
      if (event.platform === state.platform && state.phase === "idle") return [state, null];
      // Leaving BUSY abandons the submission: its token no longer matches anything that accepts results.
      return [{ phase: "idle", platform: event.platform, route: routes[event.platform], token: state.token, error: null, manual: false }, null];

    case "submit": {
      if (state.phase === "busy") return [state, null];
      if (state.phase === "sent") return [idle(state), state.route === "waitlist" ? { kind: "focus" } : null];
      if (state.route === "share") {
        const token = state.token + 1;
        return [{ phase: "busy", platform: state.platform, route: state.route, token }, { kind: "share", token }];
      }
      const email = (event.email ?? "").trim();
      if (!EMAIL_RE.test(email)) return [idle(state, { error: "invalid" }), { kind: "focus" }];
      const token = state.token + 1;
      return [{ phase: "busy", platform: state.platform, route: state.route, token }, { kind: "post", token, email, platform: state.platform }];
    }

    case "result": {
      if (state.phase !== "busy" || event.token !== state.token) return [state, null];
      const base = { platform: state.platform, route: state.route, token: state.token };
      switch (event.outcome) {
        case "shared":
        case "copied":
        case "joined":
          return [{ ...base, phase: "sent", kind: event.outcome }, null];
        case "duplicate":
          return [{ ...base, phase: "sent", kind: "already" }, null];
        case "manual":
          return [idle(state, { manual: true }), null];
        case "error":
          return [idle(state, { error: event.code ?? "generic" }), null];
        case "cancelled":
        case "aborted":
          return [idle(state), null];
      }
      return [state, null];
    }

    case "edit":
      if (state.phase === "sent") return [idle(state), null];
      if (state.phase === "idle" && state.error) return [idle(state, { manual: state.manual }), null];
      return [state, null];

    case "manual":
      if (state.phase !== "idle") return [state, null];
      return [idle(state, { error: state.error, manual: true }), null];
  }
}

export type HintKey = "hintWin" | "hintMac" | "hintLin" | "hintWaitlist";
export interface HandoffView {
  /** The dock / submit button's mode. */
  dock: "send" | "join" | "busy" | "sent";
  /** The idle hint line (null once sent or errored: the status line says that instead). */
  hint: HintKey | null;
  showEmail: boolean;
  sentKind: SentKind | null;
  error: HandoffError | null;
  manual: boolean;
}

const WAITLIST_HINT: Record<HandoffPlatform, HintKey> = { windows: "hintWaitlist", macos: "hintMac", linux: "hintLin" };

export function view(state: HandoffState): HandoffView {
  const showEmail = state.route === "waitlist";
  const idleDock = state.route === "share" ? "send" : "join";
  if (state.phase === "busy") return { dock: "busy", hint: null, showEmail, sentKind: null, error: null, manual: false };
  if (state.phase === "sent") return { dock: "sent", hint: null, showEmail, sentKind: state.kind, error: null, manual: false };
  // Only Windows can be on the share route today (release.ts ships no other installer).
  const hint: HintKey = state.route === "share" ? "hintWin" : WAITLIST_HINT[state.platform];
  return { dock: idleDock, hint: state.error ? null : hint, showEmail, sentKind: null, error: state.error, manual: state.manual };
}

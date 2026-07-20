"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, Check, Copy, RotateCcw } from "lucide-react";
import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

interface Props {
  children: ReactNode;
  /** Changes on route navigation (the layout passes the pathname). When it
   *  changes while errored, the boundary resets so one page's crash doesn't
   *  poison every sibling dashboard route. */
  resetKey?: string;
}

interface State {
  hasError: boolean;
  errorId: string | null;
  /** Number of times the user has clicked Retry on this boundary. */
  retryCount: number;
}

// Cap on user-initiated retries before we go terminal. Each retry that
// re-throws produces another Sentry event (componentDidCatch fires
// every time the children re-render and crash again), so an
// unrecoverable upstream — broken env var, missing API endpoint, dead
// orchestrator — could otherwise burn through the project's daily
// Sentry quota in seconds and pin 100% CPU on the user's tab as the
// React reconciler ping-pongs through error frames.
const MAX_RETRIES = 3;

function shortCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().slice(0, 8);
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).slice(2, 10);
}

export default class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, errorId: null, retryCount: 0 };

  public static getDerivedStateFromError(): Partial<State> {
    return { hasError: true, errorId: null };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    const errorId = shortCorrelationId();
    this.setState({ errorId });
    // Stop sending to Sentry once the user has burned through MAX_RETRIES.
    // The first N events are sufficient to diagnose; further repeats just
    // confirm the boundary is in a retry-loop, which is itself diagnostic
    // information the first event already conveyed via tags. Cap on `>=` so
    // the terminal (retries-exhausted) catch is suppressed — with `>` the
    // guard was unreachable, since `retryCount` never exceeds MAX_RETRIES.
    if (this.state.retryCount >= MAX_RETRIES) {
      console.error(`Dashboard render error (post-cap) [${errorId}]:`, error);
      return;
    }
    Sentry.setContext("dashboardErrorBoundary", {
      errorId,
      retryCount: this.state.retryCount,
    });
    // Scrub message + stack at the call site (CLAUDE.md mandate). React's
    // componentStack often quotes file paths and prop values that should
    // never reach Sentry raw.
    captureExceptionScrubbed(error, {
      tags: {
        errorId,
        scope: "DashboardErrorBoundary",
        retryCount: String(this.state.retryCount),
      },
      contexts: {
        react: { componentStack: info.componentStack ?? undefined },
        dashboardErrorBoundary: {
          errorId,
          retryCount: this.state.retryCount,
        },
      },
    });
    console.error(`Dashboard render error [${errorId}]:`, error, info);
  }

  public componentDidUpdate(prevProps: Props) {
    // A route change is a fresh context: clear the error and the retry budget so
    // navigating away from a broken page recovers the rest of the dashboard.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, errorId: null, retryCount: 0 });
    }
  }

  private handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      errorId: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <ErrorBoundaryFallback
        errorId={this.state.errorId}
        onRetry={this.handleRetry}
        retriesExhausted={this.state.retryCount >= MAX_RETRIES}
      />
    );
  }
}

function ErrorBoundaryFallback({
  errorId,
  onRetry,
  retriesExhausted,
}: {
  errorId: string | null;
  onRetry: () => void;
  retriesExhausted: boolean;
}) {
  const { t } = useTranslation();
  const strings = t.dashboard.errorBoundary;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!errorId) return;
    try {
      await navigator.clipboard.writeText(errorId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; silently ignore
    }
  };

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-xl flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
      <AlertTriangle className="mb-3 h-6 w-6 text-red-400" />
      <h2 className="text-lg font-semibold text-foreground">{strings.title}</h2>
      <p className="mt-2 text-sm text-muted-dark">{strings.description}</p>

      {errorId && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={strings.copyErrorId}
          title={strings.copyErrorId}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 font-mono text-xs text-muted-dark outline-none transition-colors hover:bg-white/[0.08] hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
        >
          <span>
            {strings.errorIdLabel}: {errorId}
          </span>
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">{strings.copied}</span>
            </>
          ) : (
            <Copy className="h-3 w-3 opacity-60" />
          )}
        </button>
      )}

      {retriesExhausted ? (
        <p className="mt-4 max-w-sm text-sm text-muted-dark">
          {t.dashboardUi.errorBoundaryFallback}
        </p>
      ) : (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm text-foreground outline-none transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
        >
          <RotateCcw className="h-4 w-4" />
          {strings.retry}
        </button>
      )}
    </div>
  );
}

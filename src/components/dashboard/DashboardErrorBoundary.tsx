"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, Check, Copy, RotateCcw } from "lucide-react";
import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

function shortCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().slice(0, 8);
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).slice(2, 10);
}

export default class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, errorId: null };

  public static getDerivedStateFromError(): State {
    return { hasError: true, errorId: null };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    const errorId = shortCorrelationId();
    this.setState({ errorId });
    Sentry.setContext("dashboardErrorBoundary", { errorId });
    Sentry.captureException(error, {
      tags: { errorId, scope: "DashboardErrorBoundary" },
      contexts: {
        react: { componentStack: info.componentStack ?? undefined },
        dashboardErrorBoundary: { errorId },
      },
    });
    console.error(`Dashboard render error [${errorId}]:`, error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorId: null });
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <ErrorBoundaryFallback
        errorId={this.state.errorId}
        onRetry={this.handleRetry}
      />
    );
  }
}

function ErrorBoundaryFallback({
  errorId,
  onRetry,
}: {
  errorId: string | null;
  onRetry: () => void;
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

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm text-foreground outline-none transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
      >
        <RotateCcw className="h-4 w-4" />
        {strings.retry}
      </button>
    </div>
  );
}

"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep local logging lightweight; global handlers can capture this too.
    console.error("Dashboard render error:", error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="mx-auto flex min-h-[40vh] max-w-xl flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
        <AlertTriangle className="mb-3 h-6 w-6 text-red-400" />
        <h2 className="text-lg font-semibold text-foreground">Dashboard panel failed to render</h2>
        <p className="mt-2 text-base text-muted-dark">
          This section hit an unexpected error. You can retry without leaving the page.
        </p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-base text-foreground transition-colors hover:bg-white/[0.08]"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }
}

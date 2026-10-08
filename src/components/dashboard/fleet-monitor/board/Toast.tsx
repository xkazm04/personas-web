"use client";

import type { ToastAction } from "./useBoardRuntime";

interface ToastProps {
  toast: { seq: number; text: string; action?: ToastAction } | null;
}

/** The board's transient status line, top centre; with an action (Undo) it
 *  takes the pointer for as long as it shows. */
export default function Toast({ toast }: ToastProps) {
  return (
    <div
      role="status"
      className={`absolute left-1/2 top-3 z-30 flex max-w-[min(640px,90%)] -translate-x-1/2 items-center gap-3 rounded-xl bg-surface py-2 pl-4 text-base text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-strong),0_12px_40px_rgb(0_0_0/0.3)] transition-opacity duration-300 ${
        toast?.action ? "pr-2" : "pr-4"
      } ${toast ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <span className="min-w-0 truncate">{toast?.text}</span>
      {toast?.action && (
        <button
          type="button"
          onClick={toast.action.run}
          className="shrink-0 rounded-lg px-3 py-1 text-sm font-semibold text-brand-cyan hover:bg-[color-mix(in_oklab,var(--brand-cyan)_12%,transparent)] focus-visible:outline-2 focus-visible:outline-foreground"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

"use client";

export function DesignVisual() {
  return (
    <div
      role="img"
      aria-label="Agent configuration preview showing: role set to Email triage assistant, tools including gmail, slack, and jira, trigger every 15 minutes, and self-healing enabled"
      className="mt-6 space-y-2.5 rounded-xl border border-purple-500/8 bg-purple-500/2 p-4 font-mono text-base relative overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(168,85,247,0.15) 3px, rgba(168,85,247,0.15) 4px)",
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-purple-400/60">
          <div className="h-2 w-2 rounded-full bg-purple-400/30 shadow-[0_0_4px_rgba(168,85,247,0.3)]" />
          <span>agent.config</span>
        </div>
        <div className="pl-4 border-l border-purple-500/10 space-y-1.5 mt-2.5">
          <div>
            <span className="text-purple-400">role</span>
            <span className="text-muted-dark">{": "}</span>
            <span className="text-emerald-400">{'"Email triage assistant"'}</span>
          </div>
          <div>
            <span className="text-purple-400">tools</span>
            <span className="text-muted-dark">{": "}</span>
            <span className="text-amber-400">{"[gmail, slack, jira]"}</span>
          </div>
          <div>
            <span className="text-purple-400">trigger</span>
            <span className="text-muted-dark">{": "}</span>
            <span className="text-cyan-400">{'"every 15 minutes"'}</span>
          </div>
          <div>
            <span className="text-purple-400">healing</span>
            <span className="text-muted-dark">{": "}</span>
            <span className="text-emerald-400">true</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoordinateVisual() {
  return (
    <div
      role="img"
      aria-label="Agent coordination chain: Email connects to Slack, then Slack connects to GitHub, showing automated multi-service workflow"
      className="mt-6 flex items-center justify-center gap-2 py-3 relative"
    >
      <div className="pointer-events-none absolute top-1/2 left-[15%] right-[15%] h-px bg-linear-to-r from-transparent via-cyan-500/8 to-transparent -translate-y-1/2" />
      {["Email", "Slack", "GitHub"].map((name, i) => (
        <div key={name} className="flex items-center gap-2">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/15 bg-cyan-500/8 text-base font-mono text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.06)]">
            {name.slice(0, 2)}
            <div className="absolute inset-0 rounded-xl border border-cyan-400/20 animate-glow-border" />
            <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400/60 shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
          </div>
          {i < 2 && (
            <div className="flex items-center gap-0.5">
              <div className="h-px w-3 bg-linear-to-r from-cyan-500/40 to-cyan-500/10" />
              <div className="h-2 w-2 rounded-full bg-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-glow-border" />
              <div className="h-px w-3 bg-linear-to-r from-cyan-500/10 to-cyan-500/40" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function TelemetryVisual() {
  return (
    <div
      role="img"
      aria-label="Real-time telemetry bar chart showing 12 metrics with varying activity levels, indicating live agent performance monitoring"
      className="mt-6 relative"
    >
      <span className="sr-only">
        Bar chart displaying agent telemetry data across 12 time intervals. Activity ranges from low to high, with peak performance spikes visible, demonstrating continuous real-time monitoring capability.
      </span>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/10 to-transparent" />
      <div className="flex items-end justify-center gap-1.25 py-3">
        {[30, 55, 40, 70, 45, 80, 60, 90, 50, 75, 65, 85].map((h, i) => (
          <div
            key={i}
            className="w-3 rounded-sm bg-linear-to-t from-amber-500/15 to-amber-400/40 animate-bar-grow relative"
            style={{ height: `${h * 0.5}px`, animationDelay: `${i * 0.05}s` }}
          >
            {h >= 80 && (
              <div className="absolute -top-px inset-x-0 h-px bg-amber-400/50 shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Lookup keyed by Feature.visualKey so features/data.ts can stay free
 * of JSX (under the convention "data files contain no JSX").
 */
export const FEATURE_VISUALS_BY_KEY = {
  design: DesignVisual,
  coordinate: CoordinateVisual,
  telemetry: TelemetryVisual,
} as const;

export type FeatureVisualKey = keyof typeof FEATURE_VISUALS_BY_KEY;

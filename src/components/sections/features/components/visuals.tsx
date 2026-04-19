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

export function DeployVisual() {
  return (
    <div
      role="img"
      aria-label="Deployment flow diagram: local Desktop app deploys to cloud for 24/7 availability"
      className="mt-6 flex items-center justify-center gap-3 py-3 relative"
    >
      <div className="pointer-events-none absolute top-1/2 left-[10%] right-[10%] h-8 -translate-y-1/2 rounded-full bg-linear-to-r from-transparent via-emerald-500/2 to-transparent" />
      <div className="relative rounded-xl border border-emerald-500/12 bg-emerald-500/5 px-4 py-2.5 text-base font-mono text-emerald-400">
        <div className="text-base text-emerald-400/60 mb-0.5">local</div>
        Desktop
        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400/70 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <svg width="48" height="8" className="text-emerald-500/60">
          <line x1="0" y1="4" x2="48" y2="4" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <polygon points="44,1 48,4 44,7" fill="currentColor" />
        </svg>
        <span className="text-base text-muted-dark font-mono">deploy</span>
      </div>
      <div className="relative rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-base font-mono text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.10)]">
        <div className="text-base text-emerald-400/60 mb-0.5">cloud</div>
        24/7
        <div className="absolute inset-0 rounded-xl border border-emerald-400/10 animate-glow-border" />
      </div>
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

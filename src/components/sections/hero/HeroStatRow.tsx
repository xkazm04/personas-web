"use client";

interface Stat {
  value: string;
  label: string;
}

/**
 * The 3-up "agents / connectors / templates" row used in two places
 * inside HeroClient: a compact mobile-only card under the CTAs, and a
 * larger version inside the desktop command-center panel. Same data,
 * different visual weight per variant.
 */
export default function HeroStatRow({
  stats,
  variant,
}: {
  stats: Stat[];
  variant: "mobile" | "desktop";
}) {
  const valueClass =
    variant === "desktop"
      ? "text-xl font-bold tracking-tight transition-colors group-hover:text-brand-cyan drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
      : "text-lg font-bold tracking-tight font-mono";
  const labelClass =
    variant === "desktop"
      ? "text-xs text-muted-dark font-mono uppercase tracking-wider transition-colors group-hover:text-foreground/70"
      : "text-xs text-muted-dark font-mono uppercase tracking-wider";
  const itemClass = variant === "desktop" ? "group" : "";

  return (
    <div
      className={`flex justify-center text-center ${variant === "desktop" ? "gap-6" : "gap-6"}`}
      data-testid="mock-stats"
    >
      {stats.map((stat) => (
        <div key={stat.label} className={itemClass}>
          <div className={valueClass}>{stat.value}</div>
          <div className={labelClass}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

interface TerminalChromeProps {
  title: string;
  status?: string;
  info?: React.ReactNode;
  className?: string;
}

export default function TerminalChrome({
  title,
  status = "connected",
  info,
  className = "",
}: TerminalChromeProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04] ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-brand-rose/40" />
          <div className="h-2 w-2 rounded-full bg-brand-amber/40" />
          <div className="h-2 w-2 rounded-full bg-brand-emerald/40" />
        </div>
        <span className="text-[10px] font-mono text-white/70 ml-1">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {info && (
          <span className="text-[10px] font-mono text-white/70">{info}</span>
        )}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.5)] animate-glow-border" />
          <span className="text-[10px] font-mono text-brand-emerald/70">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

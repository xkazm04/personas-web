import type { ShortcutMod } from "./usePlatformMod";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-white/[0.1] bg-white/[0.04] px-1.5 font-mono text-[10px] font-medium text-foreground/80 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
      {children}
    </kbd>
  );
}

export function ShortcutKeyChips({
  keys,
  mod,
}: {
  keys: string[];
  mod: ShortcutMod;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((key, index) => (
        <span key={`${key}-${index}`} className="inline-flex items-center gap-1">
          <Kbd>{key === "Mod" ? mod : key}</Kbd>
          {index < keys.length - 1 && (
            <span className="text-[10px] text-muted-dark/60">+</span>
          )}
        </span>
      ))}
    </span>
  );
}

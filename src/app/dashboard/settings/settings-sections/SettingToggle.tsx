"use client";

/** Small controlled switch used across the settings sections. */
export function SettingToggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full border transition-colors focus-ring focus-visible:ring-offset-0 ${
        on ? "border-brand-cyan/40 bg-brand-cyan/30" : "border-glass-hover bg-white/[0.05]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-foreground transition-transform ${
          on ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

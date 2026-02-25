import type { LucideIcon } from "lucide-react";

type Variant = "ghost" | "solid";

interface PrimaryCTAProps {
  href: string;
  icon: LucideIcon;
  label: string;
  /** "ghost" = dark bg with border glow, "solid" = filled cyan bg. Default: "ghost" */
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<
  Variant,
  { wrapper: string; inner: string; shimmer: string; iconClass: string }
> = {
  ghost: {
    wrapper:
      "rounded-full p-[2px] bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple animate-border-flow shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-shadow duration-500",
    inner:
      "bg-black/80 backdrop-blur-md text-white hover:bg-black/60",
    shimmer: "via-white/10",
    iconClass: "text-brand-cyan",
  },
  solid: {
    wrapper:
      "rounded-full p-px bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple animate-border-flow",
    inner:
      "bg-brand-cyan text-black hover:brightness-110",
    shimmer: "via-white/25",
    iconClass: "",
  },
};

export default function PrimaryCTA({
  href,
  icon: Icon,
  label,
  variant = "ghost",
  className = "",
}: PrimaryCTAProps) {
  const v = variantStyles[variant];

  return (
    <div className={`relative inline-block ${v.wrapper} ${className}`}>
      <a
        href={href}
        className={`group relative flex w-[min(100%,20rem)] items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 text-sm font-semibold transition-all duration-300 sm:w-auto ${v.inner}`}
      >
        <div
          className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent ${v.shimmer} to-transparent transition-transform duration-700 group-hover:translate-x-full`}
        />
        <Icon
          className={`relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 ${v.iconClass}`}
        />
        <span className="relative">{label}</span>
      </a>
    </div>
  );
}

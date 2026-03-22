type GradientVariant = "marketing" | "silver";

const VARIANTS: Record<GradientVariant, { gradient: string; shadow: string }> = {
  marketing: {
    gradient: "from-foreground via-brand-cyan/90 to-foreground/60",
    shadow: "0 0 40px color-mix(in srgb, var(--brand-cyan) 15%, transparent)",
  },
  silver: {
    gradient: "from-foreground via-muted to-foreground/70",
    shadow: "0 0 30px color-mix(in srgb, var(--foreground) 6%, transparent)",
  },
};

export default function GradientText({
  children,
  className = "",
  variant = "marketing",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: GradientVariant;
}) {
  const v = VARIANTS[variant];
  return (
    <span
      className={`bg-gradient-to-r ${v.gradient} bg-clip-text text-transparent ${className}`}
      style={{ textShadow: v.shadow }}
    >
      {children}
    </span>
  );
}

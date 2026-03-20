type GradientVariant = "marketing" | "silver";

const VARIANTS: Record<GradientVariant, { gradient: string; shadow: string }> = {
  marketing: {
    gradient: "from-white via-brand-cyan/90 to-white/60",
    shadow: "0 0 40px rgba(6,182,212,0.15)",
  },
  silver: {
    gradient: "from-white via-gray-300 to-white/70",
    shadow: "0 0 30px rgba(255,255,255,0.06)",
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

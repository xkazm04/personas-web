export default function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}

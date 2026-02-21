"use client";

export default function AnimatedBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`animated-conic-border p-[1px] ${className}`}>
      {children}
    </div>
  );
}

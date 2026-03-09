import type { ReactNode } from "react";

const scaleClasses = {
  h1: "text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem]",
  h2: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
} as const;

export default function SectionHeading({
  as: Tag = "h2",
  id,
  children,
  className = "",
}: {
  as?: "h1" | "h2";
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tag
      id={id}
      className={`font-extrabold tracking-tight drop-shadow-md ${scaleClasses[Tag]} ${className}`}
    >
      {children}
    </Tag>
  );
}

import type { ReactNode } from "react";

const scaleClasses = {
  h1: "text-[clamp(2.75rem,11vw,5.5rem)]",
  h2: "text-[clamp(2.25rem,8vw,4.5rem)]",
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
      className={`text-balance break-words font-extrabold tracking-tight drop-shadow-md ${scaleClasses[Tag]} ${className}`}
    >
      {children}
    </Tag>
  );
}

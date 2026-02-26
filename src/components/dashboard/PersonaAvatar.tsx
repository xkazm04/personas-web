"use client";

import { Bot } from "lucide-react";

const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

export default function PersonaAvatar({
  icon,
  color,
  name,
  size = "sm",
}: {
  icon?: string | null;
  color?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
}) {
  const bg = color ?? "#06b6d4";
  return (
    <div
      className={`flex items-center justify-center rounded-lg font-semibold ${sizeMap[size]}`}
      style={{ backgroundColor: `${bg}20`, color: bg }}
      title={name}
    >
      {icon ? (
        <span>{icon}</span>
      ) : (
        <Bot className="h-3.5 w-3.5" />
      )}
    </div>
  );
}

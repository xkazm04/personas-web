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
  active = false,
}: {
  icon?: string | null;
  color?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}) {
  const bg = color ?? "#06b6d4";
  return (
    <div
      className={`relative flex items-center justify-center rounded-lg font-semibold ${sizeMap[size]}`}
      style={{ backgroundColor: `${bg}20`, color: bg }}
      title={name}
    >
      {active && (
        <div
          className="absolute inset-[-2px] rounded-lg animate-breathe-glow pointer-events-none"
          style={{ boxShadow: `0 0 6px 1px ${bg}4D` }}
        />
      )}
      {icon ? (
        <span>{icon}</span>
      ) : (
        <Bot className="h-3.5 w-3.5" />
      )}
    </div>
  );
}

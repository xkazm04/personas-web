"use client";

import { motion } from "framer-motion";
import { Terminal, BarChart3, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ViewerRole = "developer" | "product-manager" | "enterprise";

interface RoleDef {
  id: ViewerRole;
  label: string;
  icon: LucideIcon;
  color: string;
  activeClasses: string;
}

const roles: RoleDef[] = [
  {
    id: "developer",
    label: "Developer",
    icon: Terminal,
    color: "#06b6d4",
    activeClasses: "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.15)]",
  },
  {
    id: "product-manager",
    label: "Product Manager",
    icon: BarChart3,
    color: "#a855f7",
    activeClasses: "border-brand-purple/30 bg-brand-purple/10 text-brand-purple shadow-[0_0_12px_rgba(168,85,247,0.15)]",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    icon: Shield,
    color: "#34d399",
    activeClasses: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]",
  },
];

export default function RoleSelector({
  active,
  onChange,
}: {
  active: ViewerRole;
  onChange: (role: ViewerRole) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-dark/50 mr-1">
        I am a
      </span>
      {roles.map((role) => {
        const isActive = active === role.id;
        const Icon = role.icon;
        return (
          <button
            key={role.id}
            onClick={() => onChange(role.id)}
            className={`relative cursor-pointer rounded-full border px-3.5 py-1.5 text-[11px] font-mono tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
              isActive
                ? role.activeClasses
                : "border-white/[0.06] bg-white/[0.02] text-muted-dark hover:border-white/[0.12] hover:text-muted"
            }`}
          >
            <Icon className="h-3 w-3" />
            {role.label}
            {isActive && (
              <motion.div
                layoutId="role-indicator"
                className="absolute inset-0 rounded-full border border-current opacity-20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

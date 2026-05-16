import { motion } from "framer-motion";
import { Shield, Wrench, Zap } from "lucide-react";

import { HEALING_ACTIONS } from "./devToolsRunnerData";

const ICONS = {
  fix: Wrench,
  zap: Zap,
  shield: Shield,
};

export function RunnerHealingColumn() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-base font-mono uppercase tracking-widest text-foreground/65">
        <Zap className="h-4 w-4" />
        Self-healing
      </div>
      <div className="space-y-2">
        {HEALING_ACTIONS.map((action, index) => {
          const ActionIcon = ICONS[action.icon as keyof typeof ICONS];

          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="rounded-lg border px-3 py-2.5"
              style={{
                borderColor: `${action.color}30`,
                backgroundColor: `${action.color}08`,
              }}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <ActionIcon
                  className="h-4 w-4 shrink-0"
                  style={{ color: action.color }}
                />
                <div className="text-base text-foreground/90 leading-snug font-medium">
                  {action.label}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-foreground/[0.06]">
                <Wrench
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: action.color }}
                />
                <span
                  className="text-base font-mono"
                  style={{ color: action.color }}
                >
                  {action.action}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

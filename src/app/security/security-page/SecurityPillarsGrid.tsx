import { motion } from "framer-motion";
import { Check, EyeOff, Monitor, Shield, Wifi } from "lucide-react";

import { SECURITY_PILLARS } from "@/data/security";
import { fadeUp } from "@/lib/animations";

const PILLAR_ICONS = { Monitor, Shield, EyeOff, Wifi } as Record<string, typeof Monitor>;

export function SecurityPillarsGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {SECURITY_PILLARS.map((pillar) => {
        const Icon = PILLAR_ICONS[pillar.icon] ?? Shield;
        return (
          <motion.div
            key={pillar.title}
            variants={fadeUp}
            className="rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8"
          >
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${pillar.color}15` }}
            >
              <Icon className="h-5 w-5" style={{ color: pillar.color }} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {pillar.title}
            </h3>
            <p className="text-base text-muted leading-relaxed mb-4">
              {pillar.description}
            </p>
            <ul className="space-y-2">
              {pillar.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted">
                  <Check
                    className="h-3.5 w-3.5 shrink-0 mt-0.5"
                    style={{ color: pillar.color }}
                  />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
}

"use client";

import { Download, Key, Zap, ArrowRight } from "lucide-react";
import type { Connector } from "@/data/connectors";

const steps = [
  { icon: Download, label: "Download app" },
  { icon: Key, label: "Add API key" },
  { icon: Zap, label: "Start automating" },
];

export default function SetupCTA({ connector }: { connector: Connector }) {
  return (
    <div className="px-8 pb-8 pt-6">
      <div className="rounded-xl border border-glass bg-white/[0.02] p-6">
        <div className="flex items-center justify-center gap-3 mb-5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${connector.color}15` }}
                >
                  <step.icon className="h-4 w-4" style={{ color: connector.color }} />
                </div>
                <span className="text-sm text-muted-dark whitespace-nowrap">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-white/60 shrink-0" />
              )}
            </div>
          ))}
        </div>

        <a
          href="/download"
          className="group flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
          style={{
            backgroundColor: `${connector.color}dd`,
            boxShadow: `0 0 20px ${connector.color}30`,
          }}
        >
          Set up {connector.label} in Personas
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

/**
 * ArchitectureDiagram — :::diagram with "[Node Label]" and "-->" arrows.
 */

interface ArchitectureDiagramProps {
  nodes: { label: string; arrow?: boolean }[];
}

export function ArchitectureDiagram({ nodes }: ArchitectureDiagramProps) {
  return (
    <div className="my-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 backdrop-blur-sm overflow-x-auto">
      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          {node.arrow && (
            <ArrowRight
              className="h-4 w-4 shrink-0 text-brand-cyan/50"
              aria-hidden="true"
            />
          )}
          <div className="relative flex items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-base font-medium text-foreground shadow-[0_0_12px_rgba(6,182,212,0.04)]">
            <div
              className="absolute inset-0 rounded-lg opacity-[0.03]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(168,85,247,0.3))",
              }}
              aria-hidden="true"
            />
            <span className="relative">{node.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

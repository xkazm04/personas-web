"use client";

import type { Connector } from "@/data/connectors";

export default function UseCaseList({ connector }: { connector: Connector }) {
  return (
    <div className="px-8 py-6 space-y-3">
      <h3 className="text-base font-mono uppercase tracking-widest text-muted-dark mb-4">What you can do</h3>
      {connector.useCases.map((uc, i) => (
        <div
          key={i}
          className="group rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.1] hover:bg-white/[0.03]"
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-base font-bold"
              style={{ backgroundColor: `${connector.color}15`, color: connector.color }}
            >
              {i + 1}
            </div>
            <div className="min-w-0">
              <h4 className="text-base font-semibold text-white">{uc.title}</h4>
              <p className="mt-1 text-base leading-relaxed text-muted-dark">{uc.description}</p>
              <code
                className="mt-2 block truncate rounded-md border px-2.5 py-1.5 text-base font-mono"
                style={{
                  borderColor: `${connector.color}15`,
                  backgroundColor: `${connector.color}05`,
                  color: `${connector.color}cc`,
                }}
              >
                {uc.command}
              </code>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import type { Connector } from "@/data/connectors";
import { categories } from "@/data/connectors";

export default function ConnectorModalHeader({ connector }: { connector: Connector }) {
  const categoryMeta = categories.find((c) => c.key === connector.category);
  const iconName = connector.icon ?? connector.name;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="px-8 pt-8 pb-6">
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold"
          style={{
            borderColor: `${connector.color}30`,
            backgroundColor: `${connector.color}10`,
            color: connector.color,
          }}
        >
          {imgError ? (
            connector.monogram
          ) : (
            <Image
              src={`/tools/${iconName}.svg`}
              alt={connector.label}
              width={32}
              height={32}
              onError={() => setImgError(true)}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">{connector.label}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-base font-mono uppercase tracking-wider"
              style={{
                backgroundColor: `${connector.color}10`,
                color: connector.color,
                border: `1px solid ${connector.color}25`,
              }}
            >
              {categoryMeta?.label ?? connector.category}
            </span>
            <span className="rounded-full border border-glass bg-white/[0.03] px-2.5 py-0.5 text-base font-mono text-muted-dark">
              Connects via {connector.authType}
            </span>
          </div>
          <p className="mt-3 text-base leading-relaxed text-muted">{connector.summary}</p>
        </div>
      </div>
    </div>
  );
}

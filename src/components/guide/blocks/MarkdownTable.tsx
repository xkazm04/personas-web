"use client";

import type { ReactNode } from "react";

/**
 * Table rendered from standard markdown pipe-table syntax. Cells are ReactNode
 * so inline markdown (`code`, **bold**, links) rendered by the caller survives —
 * plain strings still work unchanged.
 */

interface MarkdownTableProps {
  headers: ReactNode[];
  rows: ReactNode[][];
}

export function MarkdownTable({ headers, rows }: MarkdownTableProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-glass">
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-glass-hover bg-white/[0.03]">
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-2.5 text-left text-base font-semibold text-foreground whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map((row, ri) => (
            <tr key={ri} className="transition-colors hover:bg-white/[0.02]">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-2.5 text-muted-dark sm:whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

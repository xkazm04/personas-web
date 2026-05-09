"use client";

import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import type { CommandSequence } from "../types";
import { commandBrands } from "../data";

export default function CommandBadge({
  command,
  index,
}: {
  command: CommandSequence;
  index: number;
}) {
  const Icon = command.icon;
  const brand: BrandKey = commandBrands[index] ?? "cyan";

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1"
      style={{
        backgroundColor: tint(brand, 10),
        borderColor: tint(brand, 20),
      }}
    >
      <span style={{ color: BRAND_VAR[brand] }}>
        <Icon className="h-3 w-3" />
      </span>
      <span
        className="text-base font-mono font-medium"
        style={{ color: BRAND_VAR[brand] }}
      >
        {command.pillar}
      </span>
    </div>
  );
}

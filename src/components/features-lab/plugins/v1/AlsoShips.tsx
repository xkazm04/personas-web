import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { LabPlugin } from "../shared/roster";

/** The shipped plugins without a demo on stage, shown as spare cartridges on the shelf. */
export default function AlsoShips({ plugins, label }: { plugins: LabPlugin[]; label: string }) {
  if (plugins.length === 0) return null;
  return (
    <div>
      <div className="mb-2 font-mono text-[12px] uppercase tracking-[0.16em] text-foreground/60">{label}</div>
      <ul className="flex gap-2">
        {plugins.map((p) => {
          const Icon = p.icon;
          return (
            <li
              key={p.key}
              className="flex flex-1 items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-[15px] font-medium text-foreground/75"
              style={{ borderColor: tint(p.brand, 30) }}
            >
              <Icon className="h-4 w-4" style={{ color: BRAND_VAR[p.brand] }} aria-hidden="true" />
              {p.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

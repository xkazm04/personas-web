import { ChartTooltip, type ChartTooltipEntry } from "@/lib/chart-theme";

interface UsageTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
  formatToolName: (name: string) => string;
}

export function UsageTooltip({ active, payload, label, formatToolName }: UsageTooltipProps) {
  return (
    <ChartTooltip
      active={active}
      payload={payload}
      label={label}
      nameFormatter={formatToolName}
    />
  );
}

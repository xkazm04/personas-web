import { ChartTooltipContent } from "@/components/dashboard/ObservabilityCharts";

interface UsageTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  formatToolName: (name: string) => string;
}

export function UsageTooltip({ active, payload, label, formatToolName }: UsageTooltipProps) {
  return (
    <ChartTooltipContent
      active={active}
      payload={payload}
      label={label}
      nameFormatter={formatToolName}
    />
  );
}

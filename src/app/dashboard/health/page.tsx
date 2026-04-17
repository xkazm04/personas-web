"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import GradientText from "@/components/GradientText";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  BURN_RATE_TARGET_USD,
  CASCADE_EDGES,
  CASCADE_NODES,
  MOCK_BURN_RATE,
  MOCK_PREDICTIVE_ALERTS,
  type CascadeStatus,
  type PredictiveSeverity,
} from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";

const statusColors: Record<CascadeStatus, { stroke: string; fill: string }> = {
  healthy: { stroke: "#34d399", fill: "rgba(52,211,153,0.14)" },
  degraded: { stroke: "#fbbf24", fill: "rgba(251,191,36,0.14)" },
  failing: { stroke: "#f43f5e", fill: "rgba(244,63,94,0.16)" },
};

const severityStyles: Record<
  PredictiveSeverity,
  { Icon: React.ElementType; tone: string; pill: string }
> = {
  info: {
    Icon: Info,
    tone: "text-cyan-400",
    pill: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  },
  warning: {
    Icon: AlertTriangle,
    tone: "text-amber-400",
    pill: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  },
  critical: {
    Icon: AlertCircle,
    tone: "text-rose-400",
    pill: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
};

const CASCADE_W = 720;
const CASCADE_H = 260;
const NODE_R = 28;

function CascadeGraph() {
  const { t } = useTranslation();
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const nodeById = useMemo(
    () => new Map(CASCADE_NODES.map((n) => [n.id, n])),
    [],
  );

  return (
    <div className="rounded-2xl border border-glass bg-white/[0.02] p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Shield className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-base font-semibold text-foreground">
          {t.healthPage.cascade.title}
        </h2>
        <span className="text-sm text-muted-dark">
          · {t.healthPage.cascade.subtitle}
        </span>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {(["healthy", "degraded", "failing"] as CascadeStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1 text-muted-dark">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: statusColors[s].stroke }}
              />
              {t.healthPage.cascade.legend[s]}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CASCADE_W} ${CASCADE_H}`}
          className="h-[260px] w-full min-w-[520px]"
          role="img"
          aria-label={t.healthPage.cascade.title}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
            </marker>
          </defs>

          {CASCADE_EDGES.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const x1 = from.x * CASCADE_W;
            const y1 = from.y * CASCADE_H;
            const x2 = to.x * CASCADE_W;
            const y2 = to.y * CASCADE_H;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const tx = x2 - ux * (NODE_R + 6);
            const ty = y2 - uy * (NODE_R + 6);
            const color = statusColors[edge.severity].stroke;
            const id = `${edge.from}->${edge.to}`;
            const hovered = hoveredEdge === id;
            return (
              <g
                key={id}
                onMouseEnter={() => setHoveredEdge(id)}
                onMouseLeave={() => setHoveredEdge(null)}
                style={{ color }}
              >
                <line
                  x1={x1 + ux * NODE_R}
                  y1={y1 + uy * NODE_R}
                  x2={tx}
                  y2={ty}
                  stroke={color}
                  strokeOpacity={0.45 + edge.weight * 0.4}
                  strokeWidth={1 + edge.weight * 3}
                  markerEnd="url(#arrowhead)"
                />
                {hovered && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    fill={color}
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {(edge.weight * 100).toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}

          {CASCADE_NODES.map((node) => {
            const cx = node.x * CASCADE_W;
            const cy = node.y * CASCADE_H;
            const s = statusColors[node.status];
            return (
              <g key={node.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={NODE_R}
                  fill={s.fill}
                  stroke={s.stroke}
                  strokeWidth={1.5}
                />
                <text
                  x={cx}
                  y={cy - 2}
                  fill={s.stroke}
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
                <text
                  x={cx}
                  y={cy + 12}
                  fill="rgba(255,255,255,0.55)"
                  fontSize="10"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {node.score}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function BurnRateChart() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col rounded-2xl border border-glass bg-white/[0.02] p-5">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brand-purple" />
        <h2 className="text-base font-semibold text-foreground">
          {t.healthPage.burnRate.title}
        </h2>
        <span className="text-sm text-muted-dark">
          · {t.healthPage.burnRate.subtitle}
        </span>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer>
          <AreaChart
            data={MOCK_BURN_RATE}
            margin={{ top: 8, right: 12, bottom: 0, left: -10 }}
          >
            <defs>
              <linearGradient id="burn-actual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="burn-projected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              stroke="rgba(255,255,255,0.1)"
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              stroke="rgba(255,255,255,0.1)"
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(10,15,26,0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                fontSize: 12,
                backdropFilter: "blur(6px)",
              }}
              formatter={(value) =>
                typeof value === "number"
                  ? [`$${value.toFixed(2)}`]
                  : [String(value ?? "")]
              }
            />
            <Area
              type="monotone"
              dataKey="actual"
              name={t.healthPage.burnRate.actual}
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#burn-actual)"
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="projected"
              name={t.healthPage.burnRate.projected}
              stroke="#a855f7"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="url(#burn-projected)"
              connectNulls={false}
            />
            <ReferenceLine
              y={BURN_RATE_TARGET_USD}
              stroke="#f43f5e"
              strokeDasharray="4 4"
              label={{
                value: `${t.healthPage.burnRate.target} $${BURN_RATE_TARGET_USD}`,
                position: "insideTopRight",
                fill: "#f43f5e",
                fontSize: 11,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function etaString(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function PredictiveAlertsList() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col rounded-2xl border border-glass bg-white/[0.02] p-5">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-400" />
        <h2 className="text-base font-semibold text-foreground">
          {t.healthPage.predictive.title}
        </h2>
      </div>
      <p className="mb-3 text-sm text-muted-dark">
        {t.healthPage.predictive.subtitle}
      </p>

      {MOCK_PREDICTIVE_ALERTS.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-dark">
          {t.healthPage.predictive.empty}
        </p>
      ) : (
        <div className="space-y-2">
          {MOCK_PREDICTIVE_ALERTS.map((alert) => {
            const style = severityStyles[alert.severity];
            const SeverityIcon = style.Icon;
            const pct = Math.round(alert.probability * 100);
            const probLabel = t.healthPage.predictive.probability.replace(
              "{n}",
              String(pct),
            );
            const eta = t.healthPage.predictive.etaLabel.replace(
              "{t}",
              etaString(alert.etaHours),
            );
            return (
              <div
                key={alert.id}
                className="rounded-xl border border-glass bg-white/[0.02] p-3"
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${style.pill}`}
                  >
                    <SeverityIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {alert.title}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-sm font-medium ${style.pill}`}
                      >
                        {t.healthPage.predictive.severity[alert.severity]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-dark">
                      {alert.detail}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <span className="rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 font-medium text-muted">
                        {alert.persona}
                      </span>
                      <span className={`tabular-nums ${style.tone}`}>
                        {probLabel}
                      </span>
                      <span className="tabular-nums text-muted-dark">{eta}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: statusColors.failing.stroke,
                          opacity: 0.55,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HealthPage() {
  const { t } = useTranslation();
  const [fetchedAt] = useState(() => Date.now());

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-cyan/25 bg-brand-cyan/10">
          <Shield className="h-5 w-5 text-brand-cyan" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{t.healthPage.title}</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">
            {t.healthPage.subtitle}
          </p>
        </div>
        <StalenessIndicator fetchedAt={fetchedAt} className="mt-2" />
      </motion.div>

      <motion.div variants={fadeUp} className="mb-6">
        <CascadeGraph />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <BurnRateChart />
        </motion.div>
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <PredictiveAlertsList />
        </motion.div>
      </div>
    </motion.div>
  );
}

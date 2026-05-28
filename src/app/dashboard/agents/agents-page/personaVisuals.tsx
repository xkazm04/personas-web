import {
  Bot,
  CalendarCheck,
  GitPullRequest,
  MessageSquareHeart,
  ShieldCheck,
  Siren,
  type LucideIcon,
} from "lucide-react";

// Map persona name → lucide icon (Variant A) and Leonardo portrait (Variant B).
// Names match the mock fixtures in src/lib/mockData.ts.
const ICON_BY_NAME: Record<string, LucideIcon> = {
  "PR Review Agent": GitPullRequest,
  "Incident Responder": Siren,
  "Daily Standup Digest": CalendarCheck,
  "Security Scanner": ShieldCheck,
  "Customer Feedback Analyzer": MessageSquareHeart,
};

const IMAGE_BY_NAME: Record<string, string> = {
  "PR Review Agent": "/personas/pr-review-agent.png",
  "Incident Responder": "/personas/incident-responder.png",
  "Daily Standup Digest": "/personas/daily-standup-digest.png",
  "Security Scanner": "/personas/security-scanner.png",
  "Customer Feedback Analyzer": "/personas/customer-feedback-analyzer.png",
};

export function imageForPersona(name: string): string | null {
  return IMAGE_BY_NAME[name] ?? null;
}

/**
 * Renders the persona's mapped lucide icon. Wrapping the lookup in a component
 * (rather than `const Icon = iconForPersona(name); <Icon />`) keeps the
 * react-hooks/static-components lint rule happy — the rendered component is
 * always `PersonaGlyph`; the table dispatch happens inside it.
 */
export function PersonaGlyph({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = ICON_BY_NAME[name] ?? Bot;
  return <Icon className={className} style={style} />;
}

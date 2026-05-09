import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Personas vs Competitors";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard({
    title: "How Personas Compares",
    subtitle: "Feature-by-feature comparison with CrewAI, LangChain, n8n, and AutoGen. Desktop-first, free forever.",
    badge: "Comparison",
    badgeColor: "#34d399",
    accentColor: "#34d399",
    footer: "personas.ai/compare",
  });
}

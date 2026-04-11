import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Personas Product Tour";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard({
    title: "Interactive Product Tour",
    subtitle: "See how Personas works — create an agent, configure tools, set triggers, watch execution, and monitor results.",
    badge: "Tour",
    badgeColor: "#06b6d4",
    accentColor: "#06b6d4",
    footer: "personas.ai/tour",
  });
}

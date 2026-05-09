import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Personas Templates";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard({
    title: "Agent Templates",
    subtitle: "Browse 50+ ready-to-use agent templates. Email triage, DevOps automation, content pipelines, and more.",
    badge: "Templates",
    badgeColor: "#a855f7",
    accentColor: "#a855f7",
    footer: "personas.ai/templates",
  });
}

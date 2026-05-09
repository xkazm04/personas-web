import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Agent Playground",
  description:
    "See how Personas agents work. Pick a task, watch the agent think, and see the results — all in your browser.",
  openGraph: {
    title: "Agent Playground — Personas",
    description:
      "See how Personas agents work. Pick a task, watch the agent think, and see the results — all in your browser.",
    url: `${SITE_URL}/playground`,
  },
  alternates: {
    canonical: `${SITE_URL}/playground`,
  },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}

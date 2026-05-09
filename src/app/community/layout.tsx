import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Join the Personas community. Get help on Discord, contribute on GitHub, share templates, and connect with other AI agent builders.",
  openGraph: {
    title: "Community — Personas",
    description:
      "Join thousands of developers building AI agent workflows. Discord, GitHub, templates, and more.",
    url: `${SITE_URL}/community`,
  },
  alternates: { canonical: `${SITE_URL}/community` },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}

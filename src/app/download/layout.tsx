import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Download Personas for Windows, macOS, or Linux. Free AI agent orchestration — no signup, no cloud account, no telemetry.",
  openGraph: {
    title: "Download Personas — Free AI Agent Orchestration",
    description:
      "Desktop-first agent orchestration. Free forever, fully private, zero telemetry. Available for Windows, macOS, and Linux.",
    url: `${SITE_URL}/download`,
  },
  alternates: { canonical: `${SITE_URL}/download` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Personas",
  operatingSystem: "Windows, macOS, Linux",
  applicationCategory: "DeveloperApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/download`,
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}

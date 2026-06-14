import type { Metadata } from "next";
import { SITE_URL, safeJsonLd } from "@/lib/seo";
import { SECURITY_FAQS } from "@/data/security";

export const metadata: Metadata = {
  title: "Security & Privacy",
  description:
    "How Personas protects your data. Local-first architecture, AES-256 encryption, OS-native keyring, zero telemetry. Your data never leaves your machine.",
  openGraph: {
    title: "Security & Privacy — Personas",
    description:
      "Desktop-first AI agent orchestration with AES-256 encryption, zero telemetry, and air-gap capability.",
    url: `${SITE_URL}/security`,
  },
  alternates: { canonical: `${SITE_URL}/security` },
};

// FAQ structured data derived from the same SECURITY_FAQS the page renders
// (security-page/SecurityFAQItem), so the JSON-LD can never drift from the
// visible Q&A. Previously this was a hand-maintained duplicate.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SECURITY_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      {children}
    </>
  );
}

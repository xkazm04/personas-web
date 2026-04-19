import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does Personas send data to the cloud?",
      acceptedAnswer: { "@type": "Answer", text: "No. Personas runs entirely on your desktop. Your data never leaves your machine." },
    },
    {
      "@type": "Question",
      name: "How are credentials stored?",
      acceptedAnswer: { "@type": "Answer", text: "AES-256-GCM encryption with OS-native keyring integration (Windows DPAPI, macOS Keychain, Linux libsecret)." },
    },
    {
      "@type": "Question",
      name: "Does Personas collect telemetry?",
      acceptedAnswer: { "@type": "Answer", text: "No. Zero analytics, crash reports, or phone-home behavior." },
    },
    {
      "@type": "Question",
      name: "Can my employer see my agent data?",
      acceptedAnswer: { "@type": "Answer", text: "Only if they have access to your machine. Personas stores everything locally with no admin console or centralized server." },
    },
    {
      "@type": "Question",
      name: "What happens if I uninstall Personas?",
      acceptedAnswer: { "@type": "Answer", text: "All data is removed with the application. No cloud accounts, no remote backups, no residual data on external servers." },
    },
  ],
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}

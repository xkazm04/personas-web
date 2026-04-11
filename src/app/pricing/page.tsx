import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { PRICING_TIERS } from "@/data/pricing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PricingPage from "./PricingPage";

export const metadata: Metadata = {
  title: "Pricing — Plans for Every Team Size",
  description:
    "Personas is free forever for local use. Cloud plans start at $9/mo for always-on agents. Compare Local, Starter, Team, and Builder tiers.",
  alternates: { canonical: `${SITE_URL}/pricing` },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personas Pricing",
  description:
    "Compare Personas pricing tiers: Local (free), Starter, Team, and Builder.",
  url: `${SITE_URL}/pricing`,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: PRICING_TIERS.length,
    itemListElement: PRICING_TIERS.map((tier, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `Personas ${tier.name}`,
        description: tier.bestFor,
        offers: {
          "@type": "Offer",
          price:
            tier.price === "Custom"
              ? undefined
              : tier.price.replace("$", ""),
          priceCurrency: tier.price === "Custom" ? undefined : "USD",
        },
      },
    })),
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the desktop app really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Personas desktop app is free forever with unlimited local agents, full observability, and all core features. You only pay if you want cloud execution.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need my own AI provider subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Personas orchestrates AI models but doesn't include model access. You'll need an API key from Claude, OpenAI, Gemini, or another supported provider.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch plans anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Upgrade or downgrade anytime. Your agents, credentials, and data are always preserved. Downgrading disables tier-specific features but never deletes anything.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <PricingPage />
      <Footer />
    </>
  );
}

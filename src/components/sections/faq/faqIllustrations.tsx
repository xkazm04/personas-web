import type { ReactNode } from "react";
import AgentGridIllustration from "@/components/illustrations/AgentGridIllustration";
import CloudInfraIllustration from "@/components/illustrations/CloudInfraIllustration";
import LocalCloudIllustration from "@/components/illustrations/LocalCloudIllustration";
import PricingIllustration from "@/components/illustrations/PricingIllustration";
import ShieldIllustration from "@/components/illustrations/ShieldIllustration";
import TerminalIllustration from "@/components/illustrations/TerminalIllustration";

export type FAQItem = {
  question: string;
  answer: string;
  illustration: ReactNode;
};

export const FAQ_ILLUSTRATIONS_BY_POSITION = [
  <TerminalIllustration key="terminal" />,
  <ShieldIllustration key="shield" />,
  <PricingIllustration key="pricing" />,
  <CloudInfraIllustration key="cloud" />,
  <LocalCloudIllustration key="local" />,
  <AgentGridIllustration key="grid" />,
];

export const FALLBACK_ILLUSTRATION = <TerminalIllustration key="fallback" />;

export function warnOnFaqIllustrationDrift(questionCount: number) {
  if (process.env.NODE_ENV === "production" || questionCount === FAQ_ILLUSTRATIONS_BY_POSITION.length) return;
  console.warn(
    `[FAQ] questions.length (${questionCount}) does not match FAQ_ILLUSTRATIONS_BY_POSITION.length (${FAQ_ILLUSTRATIONS_BY_POSITION.length}). Some questions will get a fallback illustration. Update src/components/sections/faq/faqIllustrations.tsx when adding/removing FAQ questions in the i18n source.`,
  );
}

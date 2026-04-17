"use client";

import { motion } from "framer-motion";
import {
  Code,
  FileText,
  Search,
  Server,
  MessageSquare,
  ArrowRight,
  Zap,
  Plug,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { USE_CASES } from "@/data/use-cases";
import { BRAND_VAR, tint, brandShadow, hexToBrand } from "@/lib/brand-theme";

const ICONS: Record<string, LucideIcon> = {
  Code,
  FileText,
  Search,
  Server,
  MessageSquare,
};

const scrollMapItems = [{ label: "USE CASES", href: "#use-cases" }];

export default function UseCasesPage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        <SectionWrapper id="use-cases" aria-label="Use cases">
          <SectionIntro
            as="h1"
            eyebrow="Use Cases"
            heading="What will you"
            gradient="automate"
            trailing="?"
            description="From code reviews to customer support — see how teams use Personas to build AI agent workflows for every part of their stack."
            className="mb-16"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {USE_CASES.map((uc) => {
              const Icon = ICONS[uc.icon] ?? Code;
              const brand = hexToBrand(uc.color);
              const brandVar = BRAND_VAR[brand];
              const previewWorkflows = uc.workflows.slice(0, 2);

              return (
                <motion.div key={uc.slug} variants={fadeUp}>
                  <Link
                    href={`/use-cases/${uc.slug}`}
                    className="group relative flex flex-col h-full overflow-hidden rounded-2xl border p-6 transition-all duration-500 hover:scale-[1.01]"
                    style={{
                      borderColor: "rgba(var(--surface-overlay), 0.08)",
                      backgroundColor: "rgba(var(--surface-overlay), 0.02)",
                      backgroundImage: `linear-gradient(160deg, ${tint(brand, 12)} 0%, transparent 55%)`,
                    }}
                  >
                    {/* Ambient accent wash */}
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-opacity duration-500 opacity-40 group-hover:opacity-80"
                      style={{ backgroundColor: tint(brand, 25) }}
                    />

                    {/* Header: icon + title */}
                    <div className="relative flex items-center gap-3 mb-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: tint(brand, 16),
                          boxShadow: brandShadow(brand, 24, 22),
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: brandVar }} />
                      </div>
                      <h3
                        className="text-xl font-extrabold tracking-tight leading-tight"
                        style={{
                          color: brandVar,
                          textShadow: `0 0 24px ${tint(brand, 35)}`,
                        }}
                      >
                        {uc.title}
                      </h3>
                    </div>

                    {/* Headline */}
                    <p className="relative text-base font-semibold text-foreground/90 leading-snug mb-3">
                      {uc.headline}
                    </p>

                    {/* Description */}
                    <p className="relative text-base text-muted leading-relaxed flex-1 mb-5">
                      {uc.description}
                    </p>

                    {/* Workflow previews */}
                    <div className="relative space-y-2 mb-5">
                      {previewWorkflows.map((wf) => (
                        <div
                          key={wf.title}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-base"
                          style={{
                            backgroundColor: "rgba(var(--surface-overlay), 0.03)",
                            borderLeft: `2px solid ${tint(brand, 55)}`,
                          }}
                        >
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: brandVar }}
                          />
                          <span className="text-foreground/85 font-medium truncate">
                            {wf.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Meta footer */}
                    <div
                      className="relative flex items-center justify-between gap-3 pt-4 border-t"
                      style={{ borderColor: "rgba(var(--surface-overlay), 0.06)" }}
                    >
                      <div className="flex items-center gap-4 text-base text-muted-dark">
                        <span className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5" />
                          {uc.workflows.length} flows
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Plug className="h-3.5 w-3.5" />
                          {uc.connectors.length} connectors
                        </span>
                      </div>
                      <span
                        className="flex items-center gap-1 text-base font-semibold transition-transform group-hover:translate-x-0.5"
                        style={{ color: brandVar }}
                      >
                        Explore
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}

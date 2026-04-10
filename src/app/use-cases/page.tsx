"use client";

import { motion } from "framer-motion";
import { Code, FileText, Search, Server, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";
import { USE_CASES } from "@/data/use-cases";

const ICONS = { Code, FileText, Search, Server, MessageSquare } as Record<string, typeof Code>;

const scrollMapItems = [{ label: "USE CASES", href: "#use-cases" }];

export default function UseCasesPage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        <SectionWrapper id="use-cases" aria-label="Use cases">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-cyan/70">
              Use Cases
            </p>
            <SectionHeading>
              What will you{" "}
              <GradientText className="drop-shadow-lg">automate</GradientText>?
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              From code reviews to customer support — see how teams use Personas
              to build AI agent workflows for every part of their stack.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc) => {
              const Icon = ICONS[uc.icon] ?? Code;
              return (
                <motion.div key={uc.slug} variants={fadeUp}>
                  <Link
                    href={`/use-cases/${uc.slug}`}
                    className="group flex flex-col h-full rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 transition-colors hover:border-white/[0.1]"
                  >
                    <div
                      className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${uc.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: uc.color }} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-brand-cyan transition-colors">
                      {uc.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed flex-1">
                      {uc.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs">
                      <span className="text-muted">
                        {uc.workflows.length} workflows
                      </span>
                      <span className="text-white/10">&bull;</span>
                      <span className="text-muted">
                        {uc.connectors.length} connectors
                      </span>
                      <span className="ml-auto text-brand-cyan/60 group-hover:text-brand-cyan transition-colors flex items-center gap-1">
                        Explore <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}

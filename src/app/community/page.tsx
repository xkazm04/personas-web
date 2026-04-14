"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { SectionIntro } from "@/components/primitives";
import { staggerContainer } from "@/lib/animations";
import { CHANNELS, CONTRIBUTE_WAYS } from "./data";
import ChannelCard from "./ChannelCard";
import ContributeCard from "./ContributeCard";
import JoinCta from "./JoinCta";

const scrollMapItems = [
  { label: "COMMUNITY", href: "#community" },
  { label: "CONTRIBUTE", href: "#contribute" },
  { label: "JOIN", href: "#join-cta" },
];

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        {/* ── Hero + Channels ────────────────────────────────── */}
        <SectionWrapper id="community" aria-label="Community">
          <SectionIntro
            eyebrow="Community"
            eyebrowBrand="purple"
            heading="Built by"
            gradient="builders"
            trailing=", for builders"
            description="Join developers, DevOps engineers, and automation enthusiasts who are building AI agent workflows with Personas. Get help, share ideas, and shape the product."
            className="mb-16"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {CHANNELS.map((ch) => (
              <ChannelCard key={ch.title} channel={ch} />
            ))}
          </motion.div>
        </SectionWrapper>

        {/* ── Contribute ─────────────────────────────────────── */}
        <SectionWrapper id="contribute" aria-label="How to contribute">
          <SectionIntro
            heading="Ways to"
            gradient="contribute"
            description="Personas is better because of its community. Here's how you can help — no matter your skill level."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {CONTRIBUTE_WAYS.map((way) => (
              <ContributeCard key={way.title} way={way} />
            ))}
          </motion.div>
        </SectionWrapper>

        <JoinCta />
      </PageShell>
      <Footer />
    </>
  );
}

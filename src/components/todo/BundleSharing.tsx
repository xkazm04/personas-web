"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Upload, Download, ShieldCheck, Eye, ArrowLeftRight, ArrowRight } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

const flowSteps = [
  { label: "Export", icon: Upload, color: "#06b6d4" },
  { label: "Encrypt", icon: ShieldCheck, color: "#a855f7" },
  { label: "Share", icon: ArrowLeftRight, color: "#34d399" },
  { label: "Preview", icon: Eye, color: "#fbbf24" },
  { label: "Import", icon: Download, color: "#f43f5e" },
];

const sharingFeatures = [
  { icon: Package, title: "Full bundle export", desc: "Export persona + credentials + triggers + automations as a single encrypted bundle. Share with teammates or back up your work.", color: "#06b6d4" },
  { icon: Eye, title: "Import preview", desc: "Before importing, see exactly what's inside — personas, credentials, settings. Selective import lets you pick what you need.", color: "#a855f7" },
  { icon: ShieldCheck, title: "Bundle verification", desc: "Cryptographic integrity checks ensure nothing was tampered with. Sealed enclaves with RSA-signed configs.", color: "#34d399" },
  { icon: ArrowLeftRight, title: "Competitive import", desc: "Compare incoming bundle with existing personas. See conflicts, duplicates, and merge strategies before importing.", color: "#fbbf24" },
  { icon: Upload, title: "Enclave system", desc: "Create cryptographically signed, sealed bundles. Policy controls define what can be sealed and who can unseal.", color: "#f43f5e" },
  { icon: Download, title: "Data portability", desc: "GDPR-ready full system export. Selective export for specific personas or credentials. Import from external systems.", color: "#60a5fa" },
];

export default function BundleSharing() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <SectionWrapper id="sharing">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Bundle sharing &{" "}
            <GradientText className="drop-shadow-lg">portability</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Export everything as encrypted bundles. Share agents between teams,
          <span className="text-white/80 font-medium"> verify integrity</span>, and import with conflict resolution.
        </motion.p>
      </motion.div>

      {/* Animated flow diagram */}
      <motion.div variants={fadeUp} className="mt-16 mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {flowSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1 sm:gap-2">
              <motion.div
                onMouseEnter={() => setActiveStep(i)}
                onMouseLeave={() => setActiveStep(null)}
                whileHover={{ scale: 1.15, y: -4 }}
                className={`flex flex-col items-center gap-2 cursor-default transition-all duration-300`}
              >
                <motion.div
                  className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border transition-all duration-300 ${
                    activeStep === i
                      ? "border-white/20 bg-white/8 shadow-lg"
                      : "border-white/8 bg-white/3"
                  }`}
                  style={{
                    boxShadow: activeStep === i ? `0 0 20px ${step.color}25` : undefined,
                  }}
                >
                  <step.icon
                    className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300"
                    style={{
                      color: activeStep === i ? step.color : "rgba(255,255,255,0.4)",
                      filter: activeStep === i ? `drop-shadow(0 0 6px ${step.color}60)` : undefined,
                    }}
                  />
                </motion.div>
                <span className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                  activeStep === i ? "text-white/70" : "text-white/25"
                }`}>
                  {step.label}
                </span>
              </motion.div>
              {i < flowSteps.length - 1 && (
                <ArrowRight className={`h-3 w-3 mb-5 transition-colors duration-300 ${
                  activeStep !== null && (activeStep === i || activeStep === i + 1)
                    ? "text-white/30"
                    : "text-white/8"
                }`} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
        {sharingFeatures.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${f.color}12` }}
            className="group rounded-xl border border-white/6 bg-white/2 p-5 transition-all duration-300 hover:border-white/15 hover:bg-white/5"
          >
            <f.icon className="h-5 w-5 mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: f.color }} />
            <div className="text-sm font-medium text-white/90">{f.title}</div>
            <div className="mt-1.5 text-xs text-muted-dark leading-relaxed">{f.desc}</div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}

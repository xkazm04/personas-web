"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import SecurityVaultPillars from "./SecurityVaultPillars";

export default function SecurityVault() {
  return (
    <SectionWrapper id="security">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Your data never{" "}
            <GradientText className="drop-shadow-lg">leaves</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-foreground/85 font-light text-base md:text-lg leading-relaxed"
        >
          Every password, API key, and access token is encrypted on your device
          using the same security standard banks rely on. Credentials are stored
          in your operating system&apos;s own secure vault —{" "}
          <span className="text-foreground font-medium">
            nothing is sent to the cloud, ever.
          </span>
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12"
      >
        <SecurityVaultPillars />
      </motion.div>
    </SectionWrapper>
  );
}

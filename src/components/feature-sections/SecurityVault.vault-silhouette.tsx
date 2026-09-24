"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import VaultSilhouetteArt from "./SecurityVault.vault-silhouette.art";

/**
 * /illustrate 1.1.0 - "vault-silhouette": the app's vault screen reduced to shape.
 * Credential rows seal one by one; the shield ring fills; nothing leaves the card.
 */
export default function SecurityVaultSilhouette() {
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
          Every password, API key, and token, encrypted on your device.
        </motion.p>
      </motion.div>

      <div className="mt-12">
        <VaultSilhouetteArt />
      </div>
    </SectionWrapper>
  );
}

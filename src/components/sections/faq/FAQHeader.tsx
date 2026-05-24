import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

export function FAQHeader({ heading, headingGradient, subtitle }: { heading: string; headingGradient: string; subtitle: string }) {
  return (
    <motion.div variants={fadeUp} className="text-center relative">
      <h2 id="faq-heading" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
        {heading} <GradientText className="drop-shadow-lg">{headingGradient}</GradientText>
      </h2>
      <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">{subtitle}</p>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

export function SettingsHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div variants={fadeUp} className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight">
        <GradientText variant="silver">{title}</GradientText>
      </h1>
      <p className="mt-1 text-base text-muted-dark">{subtitle}</p>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { DiscordIcon } from "@/components/icons/brand-icons";
import { DISCORD_INVITE_URL } from "@/lib/constants";
import { fadeUp } from "@/lib/animations";

export function FAQDiscordCTA({
  stillQuestions,
  discordSubtitle,
  joinDiscord,
}: {
  stillQuestions: string;
  discordSubtitle: string;
  joinDiscord: string;
}) {
  return (
    <motion.div variants={fadeUp} className="mt-14 text-center">
      <div className="mx-auto inline-flex flex-col items-center gap-4 rounded-2xl border border-glass bg-gradient-to-br from-white/[0.02] to-transparent px-8 py-6 sm:flex-row sm:gap-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 ring-1 ring-brand-purple/20">
          <DiscordIcon className="h-5 w-5 text-brand-purple" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-base font-medium">{stillQuestions}</p>
          <p className="mt-1 text-base text-muted-dark">{discordSubtitle}</p>
        </div>
        <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-brand-purple/20 bg-brand-purple/10 px-6 py-2 text-base font-medium text-brand-purple transition-all duration-300 hover:border-brand-purple/30 hover:bg-brand-purple/15 focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:outline-none">
          {joinDiscord}
        </a>
      </div>
    </motion.div>
  );
}

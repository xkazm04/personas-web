import Image from "next/image";
import { DiscordIcon, GithubIcon, TwitterIcon } from "@/components/icons/brand-icons";
import { DISCORD_INVITE_URL } from "@/lib/constants";

export function FooterBrand({ motto }: { motto: string }) {
  return (
    <div className="md:col-span-2">
      <div className="flex items-center gap-2.5">
        {/* width/height mirror the source's 1344×768 (1.75:1) aspect ratio so the
    h-6 w-auto CSS sizing keeps it without a dev-mode aspect warning. */}
        <Image src="/imgs/logo.png" alt="Personas logo" width={42} height={24} className="h-6 w-auto object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
        <span className="font-semibold tracking-tight">Personas</span>
      </div>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-dark">{motto}</p>
      <div className="mt-4 flex items-center gap-3">
        <FooterSocialLink href="https://github.com/personas-ai" label="GitHub"><GithubIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" /></FooterSocialLink>
        <FooterSocialLink href="https://twitter.com/personas_ai" label="Twitter"><TwitterIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" /></FooterSocialLink>
        <FooterSocialLink href={DISCORD_INVITE_URL} label="Discord"><DiscordIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" /></FooterSocialLink>
      </div>
    </div>
  );
}

function FooterSocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="group flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-glass bg-white/2 text-muted-dark transition-all duration-300 hover:border-glass-hover hover:text-muted hover:bg-white/4 hover:shadow-[0_0_10px_rgba(255,255,255,0.02)] focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none">
      {children}
    </a>
  );
}

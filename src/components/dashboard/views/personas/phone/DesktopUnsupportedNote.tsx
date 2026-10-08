import { Laptop } from "lucide-react";
import { mobileCopy } from "@/i18n/pending/mobile";

/**
 * Why an action is off on the desktop data plane: the desktop's local API does
 * not serve it (`desktopUnsupported`), and the Personas app does. Shown where a
 * review verdict, which this plane cannot take, would otherwise fail on click.
 */
export default function DesktopUnsupportedNote() {
  return (
    <section
      data-desktop-unsupported
      className="flex items-start gap-2 rounded-2xl border border-glass bg-white/[0.02] p-4 text-base text-foreground"
    >
      <Laptop aria-hidden className="mt-0.5 h-4 w-4 flex-none text-brand-cyan" />
      <p>{mobileCopy.reach.desktopUnsupported}</p>
    </section>
  );
}

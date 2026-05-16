import { motion } from "framer-motion";
import { FileText, Link2, Sparkles } from "lucide-react";

import { BACKLINKS, CAPTURES } from "./secondBrainData";

export function SecondBrainSidePanel({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="rounded-xl border border-purple-400/25 bg-purple-500/[0.05] px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="h-3.5 w-3.5 text-purple-300" />
          <span className="text-base font-mono uppercase tracking-widest text-purple-300/85 font-semibold">
            Connections
          </span>
          <span className="ml-auto text-base font-mono text-foreground/60 tabular-nums">
            {BACKLINKS.length}
          </span>
        </div>
        <div className="space-y-1.5">
          {BACKLINKS.map((backlink, index) => (
            <motion.div
              key={backlink.label}
              initial={{ opacity: 0, x: 6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: reduced ? 0 : 0.25,
                delay: reduced ? 0 : 0.5 + index * 0.06,
              }}
              className="flex items-start gap-2 rounded-md bg-foreground/[0.02] px-2 py-1.5"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5 text-purple-300/80" />
              <div className="min-w-0">
                <div className="text-base font-mono text-foreground/90 truncate">
                  {backlink.label}
                </div>
                <div className="text-base font-mono text-foreground/60 truncate">
                  {backlink.note}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-base font-mono uppercase tracking-widest text-foreground/70 font-semibold">
            Recent thoughts
          </span>
        </div>
        <div className="space-y-1.5">
          {CAPTURES.map((capture, index) => (
            <motion.div
              key={capture.text}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: reduced ? 0 : 0.25,
                delay: reduced ? 0 : 0.8 + index * 0.06,
              }}
              className="flex items-start gap-2 text-base font-mono"
            >
              <span className="text-foreground/60 tabular-nums shrink-0 w-8">
                {capture.time}
              </span>
              <span className="text-foreground/85 truncate">{capture.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

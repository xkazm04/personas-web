import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function SecurityFAQItem({
  question,
  answer,
  idx,
}: {
  question: string;
  answer: string;
  idx: number;
}) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const panelId = `faq-${idx}`;
  const triggerId = `faq-trigger-${idx}`;

  return (
    <div className="border-b border-glass last:border-b-0">
      <button
        id={triggerId}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between py-4 text-left cursor-pointer"
      >
        <span className="text-base font-medium text-foreground pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-base text-muted leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

/**
 * StepWizard block — :::steps with numbered items in guide markdown.
 */

interface StepWizardProps {
  steps: { title: string; body: string }[];
}

export function StepWizard({ steps }: StepWizardProps) {
  return (
    <div className="my-6 relative pl-8">
      {/* Vertical connecting line */}
      <div
        className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-cyan/40 via-brand-purple/30 to-transparent"
        aria-hidden="true"
      />
      <ol className="space-y-5 list-none" aria-label="Setup steps">
        {steps.map((step, i) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-8 top-0.5 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-glass-strong bg-white/[0.05] text-base font-bold text-brand-cyan backdrop-blur-sm"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <p className="text-base leading-relaxed text-foreground font-medium">
              {step.title}
            </p>
            {step.body && (
              <p className="mt-1 text-base leading-relaxed text-muted-dark">
                {step.body}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

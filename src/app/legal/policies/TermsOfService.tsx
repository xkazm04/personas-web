export default function TermsOfService() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.05] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
          TL;DR
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
          <li>The core app is free and runs entirely on your machine.</li>
          <li>
            You own everything you create — agents, pipelines, prompts, all
            yours.
          </li>
          <li>
            You&apos;re responsible for your own AI provider subscriptions and
            what your agents do.
          </li>
          <li>
            You can stop anytime; your local data stays with you, cloud data
            deleted on request.
          </li>
        </ul>
      </div>

      <p className="text-base text-muted-dark">Last updated: April 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Acceptance of Terms
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          By downloading, installing, or using Personas, you agree to these
          terms. If you do not agree, please do not use the software. We may
          update these terms from time to time — continued use after changes
          constitutes acceptance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Description of Service
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          Personas is a desktop application for building and orchestrating AI
          agent pipelines. The core app is free and runs entirely on your
          machine. Optional paid cloud tiers provide remote execution,
          scheduling, and team collaboration features.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          User Responsibilities
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-base leading-relaxed text-muted-dark">
          <li>
            You must hold your own valid subscriptions to any AI providers you
            connect (e.g., Anthropic, OpenAI) and comply with their terms of
            service.
          </li>
          <li>
            You are responsible for the content your agents produce and the
            actions they take.
          </li>
          <li>
            You agree not to use Personas for any unlawful purpose or in
            violation of any applicable laws.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Intellectual Property
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          Your agents, pipelines, prompts, and data are yours. Personas does
          not claim any ownership or license over content you create with the
          software. The Personas application, brand, and website content remain
          our intellectual property.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Limitation of Liability
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          Personas is provided &ldquo;as is&rdquo; without warranties of any
          kind. We are not liable for any damages arising from the use of the
          software, including but not limited to data loss, service
          interruptions, or actions taken by AI agents you configure. Your use
          of third-party AI services is governed by their respective terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Termination</h2>
        <p className="text-base leading-relaxed text-muted-dark">
          You may stop using Personas at any time. For cloud features, we may
          suspend or terminate your account if you violate these terms. Upon
          termination, your local data remains on your device; cloud data will
          be deleted within 30 days upon request.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Changes to Terms
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          We may revise these terms at any time by posting the updated version
          on this page. Material changes will be communicated via the app or
          email. The &ldquo;last updated&rdquo; date at the top indicates the
          latest revision.
        </p>
      </section>
    </div>
  );
}

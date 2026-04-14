export default function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <p className="text-base text-muted-dark">Last updated: April 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Our Commitment to Privacy
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          Personas is built on a simple principle: your data belongs to you.
          Our desktop app is local-first with zero telemetry by default. We do
          not collect, transmit, or analyze your usage data unless you
          explicitly opt in to cloud features.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          What the Desktop App Stores
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          Everything the Personas desktop app creates — your agents, pipelines,
          execution history, and configuration — lives on your local machine.
          None of this data is transmitted to our servers or any third party.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          How Credentials Are Protected
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          API keys and secrets you add to Personas are encrypted at rest using
          AES-256-GCM and stored in your operating system&apos;s keyring. They
          never leave your device — not even when you use cloud features.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          What We Collect for Cloud Features
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          If you sign in with Google OAuth to use cloud features, we store your
          email address and basic profile information through Supabase (our
          authentication provider). Paid cloud tiers may store agent execution
          metadata on our servers to enable scheduling and remote execution.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Website Analytics
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          This website collects basic, anonymous page-view analytics to help us
          understand which pages are useful. We do not track individual users,
          build advertising profiles, or sell data to third parties.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Third-Party Services
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-base leading-relaxed text-muted-dark">
          <li>
            <strong className="text-foreground/80">Supabase</strong> —
            authentication and cloud data storage
          </li>
          <li>
            <strong className="text-foreground/80">Sentry</strong> — error
            tracking on this website only (not in the desktop app)
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
        <p className="text-base leading-relaxed text-muted-dark">
          You can request access to, correction of, or deletion of any personal
          data we hold at any time. You can also export all of your local data
          directly from the desktop app. To exercise these rights, contact us
          at{" "}
          <a
            href="mailto:legal@personas.ai"
            className="text-brand-cyan hover:underline"
          >
            legal@personas.ai
          </a>
          .
        </p>
      </section>
    </div>
  );
}

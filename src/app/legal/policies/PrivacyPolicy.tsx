import { POLICY_META } from "@/data/policy-changelog";

type Props = { changelog?: React.ReactNode };

export default function PrivacyPolicy({ changelog }: Props) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.05] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
          TL;DR
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
          <li>
            Your agents and data stay on your device. The desktop app sends
            only anonymous error reports and usage signals, and you can turn
            most of them off.
          </li>
          <li>
            API keys are encrypted with AES-256 and never leave your machine.
          </li>
          <li>We only collect your email if you opt into cloud features.</li>
          <li>You can export or delete everything anytime — just ask.</li>
        </ul>
      </div>

      <p className="text-base text-muted-dark">Last updated: {POLICY_META.privacy.formattedUpdate}</p>

      {changelog}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Our Commitment to Privacy
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          Personas is built on a simple principle: your data belongs to you.
          Our desktop app is local-first. Your agents, prompts, outputs, and
          credentials are never sent to us. The only data the app sends us is
          the anonymous diagnostics described under &quot;Desktop App Error
          Reports and Usage Signals&quot; below.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          What the Desktop App Stores
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          Everything the Personas desktop app creates — your agents, pipelines,
          execution history, and configuration — lives on your local machine.
          None of it is transmitted to our servers. When an agent runs, its
          prompt goes directly from your machine to the AI provider you chose
          (Claude by Anthropic, or a local Ollama model that never leaves your
          machine).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Desktop App Error Reports and Usage Signals
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          Release builds of the desktop app send error reports (error message,
          stack trace, operating system, architecture, and app version) and
          anonymous usage signals (app sessions, which sections and tabs you
          open, key actions such as creating an agent, and one-time milestones)
          to Sentry. Sessions and milestones are tied only to a random device or
          install ID. IP addresses, email addresses, usernames, and request
          bodies and headers are stripped before anything is sent. There are no
          performance traces, no session replays, and no user identity, and
          your prompts, persona content, and credentials are never included.
        </p>
        <p className="text-base leading-relaxed text-muted-dark">
          You can turn off usage signals and error reports from the app&apos;s
          interface at first launch or at any time in Settings &gt; Account.
          Crash reports from the app&apos;s native core are not covered by that
          switch yet. Development builds and builds you compile from source
          send nothing.
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
          authentication provider).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Website Analytics
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          If you choose &quot;Accept All&quot; in the cookie banner, this website
          counts page views and a few key actions (download clicks, waitlist
          sign-ups, feature votes, and comments) anonymously to help us
          understand which pages are useful. If you choose &quot;Essential
          Only&quot;, nothing is counted. We do not track individual users,
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
            tracking and the anonymous counts above on this website, and the
            desktop app&apos;s error reports and usage signals
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

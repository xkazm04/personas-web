export default function CookiePolicy() {
  return (
    <div className="space-y-8">
      <p className="text-base text-muted-dark">Last updated: April 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Our Approach to Cookies
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          We use the bare minimum. This website sets only essential cookies
          required for the site to function. We do not use advertising cookies,
          tracking pixels, or fingerprinting of any kind.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Essential Cookies We Use
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-base leading-relaxed text-muted-dark">
          <li>
            <strong className="text-foreground/80">
              Authentication session
            </strong>{" "}
            — keeps you signed in when using cloud features (set by Supabase)
          </li>
          <li>
            <strong className="text-foreground/80">Theme preference</strong> —
            remembers your chosen color theme across visits
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          What We Do Not Use
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-base leading-relaxed text-muted-dark">
          <li>No advertising or remarketing cookies</li>
          <li>No cross-site tracking</li>
          <li>No social media tracking pixels</li>
          <li>No analytics cookies that identify individual users</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Third-Party Cookies
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          Supabase, our authentication provider, may set cookies necessary for
          the OAuth sign-in flow. These are strictly functional and are not
          used for tracking.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Managing Cookies
        </h2>
        <p className="text-base leading-relaxed text-muted-dark">
          You can clear or block cookies through your browser settings at any
          time. Note that disabling essential cookies may prevent cloud sign-in
          from working. For questions, reach out to{" "}
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

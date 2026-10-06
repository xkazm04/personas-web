import { formatPolicyMonth } from "@/data/policy-changelog";
import { useTranslation } from "@/i18n/useTranslation";

type Props = { changelog?: React.ReactNode };

const LEGAL_EMAIL = "legal@personas.ai";

const H2 = "text-xl font-semibold text-foreground";
const P = "text-base leading-relaxed text-muted-dark";

function Section({ heading, paragraphs }: { heading: string; paragraphs: string[] }) {
  return (
    <section className="space-y-3">
      <h2 className={H2}>{heading}</h2>
      {paragraphs.map((text) => (
        <p key={text} className={P}>
          {text}
        </p>
      ))}
    </section>
  );
}

export default function PrivacyPolicy({ changelog }: Props) {
  const { t, language } = useTranslation();
  const p = t.privacyPolicy;
  const analytics = p.analyticsBody
    .replace("{acceptAll}", t.cookieConsent.acceptAll)
    .replace("{essentialOnly}", t.cookieConsent.essentialOnly);
  const [emailBefore, emailAfter = ""] = p.rightsBody.split("{email}");

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.05] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
          TL;DR
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
          {p.tldr.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <p className="text-base text-muted-dark">
        {p.lastUpdated.replace("{date}", formatPolicyMonth("privacy", language))}
      </p>

      {changelog}

      <Section heading={p.commitmentHeading} paragraphs={[p.commitmentBody]} />
      <Section heading={p.desktopHeading} paragraphs={[p.desktopBody]} />
      <Section heading={p.telemetryHeading} paragraphs={[p.telemetryBody, p.telemetryControls]} />
      <Section heading={p.credentialsHeading} paragraphs={[p.credentialsBody]} />
      <Section
        heading={p.syncHeading}
        paragraphs={[
          p.syncIntro,
          p.syncNever,
          p.syncOptIns,
          p.syncNotes,
          p.syncChats,
          p.syncMasking,
          p.syncDeletion,
          p.syncWhere,
        ]}
      />
      <Section heading={p.phonesHeading} paragraphs={[p.phonesIntro, p.phonesLimits, p.phonesKey, p.phonesRevoke]} />
      <Section heading={p.accountHeading} paragraphs={[p.accountBody]} />
      <Section heading={p.analyticsHeading} paragraphs={[analytics]} />

      <section className="space-y-3">
        <h2 className={H2}>{p.thirdPartyHeading}</h2>
        <ul className="list-disc pl-5 space-y-1 text-base leading-relaxed text-muted-dark">
          <li>
            <strong className="text-foreground/80">Supabase</strong>: {p.thirdPartySupabase}
          </li>
          <li>
            <strong className="text-foreground/80">Sentry</strong>: {p.thirdPartySentry}
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className={H2}>{p.rightsHeading}</h2>
        <p className={P}>
          {emailBefore}
          <a href={`mailto:${LEGAL_EMAIL}`} className="text-brand-cyan hover:underline">
            {LEGAL_EMAIL}
          </a>
          {emailAfter}
        </p>
      </section>
    </div>
  );
}

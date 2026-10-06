import { formatPolicyMonth } from "@/data/policy-changelog";
import {
  STORAGE_CATEGORIES,
  STORAGE_REGISTER,
  type StorageCategory,
} from "@/data/storage-register";
import CookieSettingsButton from "@/components/CookieSettingsButton";
import { useTranslation } from "@/i18n/useTranslation";

type Props = { changelog?: React.ReactNode };

const LEGAL_EMAIL = "legal@personas.ai";

export default function CookiePolicy({ changelog }: Props) {
  const { t, language } = useTranslation();
  const c = t.cookiePolicy;
  const [emailBefore, emailAfter = ""] = c.managingBody.split("{email}");

  const entriesFor = (category: StorageCategory) =>
    STORAGE_REGISTER.filter((entry) => entry.category === category);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.05] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
          TL;DR
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
          {c.tldr.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <p className="text-base text-muted-dark">
        {c.lastUpdated.replace("{date}", formatPolicyMonth("cookies", language))}
      </p>

      {changelog}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">{c.approachHeading}</h2>
        <p className="text-base leading-relaxed text-muted-dark">{c.approachBody}</p>
      </section>

      <section className="space-y-5">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">{c.registerHeading}</h2>
          <p className="text-base leading-relaxed text-muted-dark">{c.registerIntro}</p>
        </div>

        {STORAGE_CATEGORIES.map((category) => (
          <div key={category} className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">{c.categories[category].title}</h3>
            <p className="text-sm leading-relaxed text-muted-dark">{c.categories[category].description}</p>
            <dl className="divide-y divide-glass rounded-lg border border-glass">
              {entriesFor(category).map((entry) => (
                <div key={entry.names[0]} className="grid gap-2 p-3 text-sm sm:grid-cols-[minmax(0,14rem)_1fr]">
                  <dt className="min-w-0 space-y-1">
                    {entry.names.map((name) => (
                      <code key={name} className="block break-all font-mono text-xs text-foreground/80">
                        {name}
                      </code>
                    ))}
                    <span className="block text-xs text-muted-dark">
                      {c.mechanisms[entry.mechanism]} · {c.lifetimes[entry.lifetime]}
                    </span>
                  </dt>
                  <dd className="leading-relaxed text-muted-dark">{c.purposes[entry.purpose]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">{c.categories.analytics.title}</h3>
          <p className="text-sm leading-relaxed text-muted-dark">{c.categories.analytics.description}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">{c.notUsedHeading}</h2>
        <ul className="list-disc pl-5 space-y-1 text-base leading-relaxed text-muted-dark">
          {c.notUsed.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">{c.thirdPartyHeading}</h2>
        <p className="text-base leading-relaxed text-muted-dark">{c.thirdPartyBody}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">{c.managingHeading}</h2>
        <p className="text-base leading-relaxed text-muted-dark">
          {emailBefore}
          <a href={`mailto:${LEGAL_EMAIL}`} className="text-brand-cyan hover:underline">
            {LEGAL_EMAIL}
          </a>
          {emailAfter}
        </p>
        <CookieSettingsButton label={c.manageButton} />
      </section>
    </div>
  );
}

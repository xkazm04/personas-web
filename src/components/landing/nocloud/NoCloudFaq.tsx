import { useTranslation } from "@/i18n/useTranslation";

/** Plain answers, native disclosure elements: keyboard and screen readers for free. */
export default function NoCloudFaq() {
  const { t } = useTranslation();
  const f = t.landingNext.nocloud.faq;
  return (
    <div className="ln-faq">
      <div>
        <p className="ln-idx">{f.kicker}</p>
        <h3>{f.heading}</h3>
      </div>
      <div className="ln-faq-list">
        {f.items.map((it, i) => (
          <details key={it.q}>
            <summary>
              <span>{`0${i + 1}`}</span>
              {it.q}
              <b aria-hidden="true">+</b>
            </summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

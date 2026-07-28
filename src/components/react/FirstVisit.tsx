import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';

/**
 * The practical questions a first-time visitor has and the site otherwise
 * doesn't answer: parking, children, access, what to wear.
 *
 * Renders nothing until the church supplies answers. The plumbing ships now so
 * that filling it in is a data-only edit in `homeCopy.ts` — but a half-built
 * section reassuring people about a building nobody has described would be
 * worse than no section at all, so an empty list means no section.
 */
export function FirstVisit() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];

  if (t.firstVisit.length === 0) return null;

  return (
    <section id="eerste-besoek" className="scroll-mt-24 bg-tan py-16">
      <div className="mx-auto max-w-content px-7">
        <h2 className="mb-2 font-serif text-[34px] font-medium text-ink">
          {t.firstVisitHeading}
        </h2>
        <p className="mb-8 text-slate">{t.firstVisitSub}</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
          {t.firstVisit.map((entry) => (
            <div key={entry.q} className="rounded-card border border-subtle bg-cream-card p-5">
              <div className="mb-1.5 font-serif text-xl text-ink">{entry.q}</div>
              <div className="text-[15px] leading-relaxed text-slate">{entry.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

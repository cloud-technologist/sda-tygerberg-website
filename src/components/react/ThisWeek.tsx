import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';

export function ThisWeek() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];

  return (
    <section id="week" className="mx-auto max-w-content scroll-mt-24 px-7 py-16">
      <h2 className="mb-2 font-serif text-[34px] font-medium text-ink">{t.weekHeading}</h2>
      <p className="mb-8 text-slate">{t.weekSub}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {t.week.map((entry) => (
          <div
            key={entry.day}
            className="rounded-card border border-subtle bg-cream-card p-5"
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-orange">
              {entry.day}
            </div>
            <div className="mb-1.5 font-serif text-xl text-ink">{entry.name}</div>
            <div className="text-[13px] font-bold text-slate">{entry.time}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

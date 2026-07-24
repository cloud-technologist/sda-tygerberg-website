import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { SERVICE_TIMES } from '../../data/site';

export function ServiceTimesStrip() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];

  return (
    <section className="bg-navy text-white">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-x-0 gap-y-3 px-7 py-5 text-center">
        <span className="border-l border-white/20 px-5 py-1 text-xs font-bold uppercase tracking-[.1em] first:border-l-0">
          {t.timesLabel}
        </span>
        {SERVICE_TIMES.map((entry) => (
          <span key={entry.en} className="border-l border-white/20 px-5 py-1 text-sm">
            {entry[lang]} <strong className="text-base">{entry.time}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}

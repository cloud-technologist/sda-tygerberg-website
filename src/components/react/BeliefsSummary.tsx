import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';

export function BeliefsSummary() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="glo" className="mx-auto grid max-w-content scroll-mt-24 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-13 px-7 py-16">
      <div className="self-start md:sticky md:top-25">
        <div className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-orange">
          {lang === 'af' ? '28 FUNDAMENTELE LEERSTELLINGS' : '28 FUNDAMENTAL BELIEFS'}
        </div>
        <h2 className="mb-4 font-serif text-[34px] font-medium text-ink">{t.beliefsHeading}</h2>
        <p className="mb-7 text-slate">{t.beliefsSub}</p>
        <a
          href="/beliefs/"
          className="inline-block rounded-pill bg-orange px-5.5 py-3 font-semibold text-white hover:bg-orange-hover"
        >
          {t.beliefRead}
        </a>
      </div>

      <div className="flex flex-col gap-2.5">
        {t.beliefTitles.map((title, i) => {
          const open = openIndex === i;
          return (
            <div key={title} className="overflow-hidden rounded-card border border-subtle bg-cream-card">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-5.5 py-5 text-left font-inherit"
              >
                <span className="flex items-center gap-3.5">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-navy/10 font-serif text-xs font-bold text-navy">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-[23px] text-ink">{title}</span>
                </span>
                <span className="flex-none text-2xl font-light text-navy">{open ? '–' : '+'}</span>
              </button>
              {open && (
                <div className="px-5.5 pb-5.5 pl-15 text-[15px] leading-relaxed text-slate">
                  {t.beliefDescs[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

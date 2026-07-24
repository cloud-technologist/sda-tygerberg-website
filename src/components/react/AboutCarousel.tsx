import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { departmentHeads } from '../../data/departmentHeads';

const AUTOPLAY_MS = 4200;
const CARDS_PER_PAGE = 3;

export function AboutCarousel() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];
  const pageCount = Math.max(1, Math.ceil(departmentHeads.length / CARDS_PER_PAGE));
  const [page, setPage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPage((p) => (p + 1) % pageCount);
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  const goTo = (n: number) => {
    setPage(((n % pageCount) + pageCount) % pageCount);
    resetTimer();
  };

  return (
    <section id="oor" className="scroll-mt-24 bg-tan py-16">
      <div className="mx-auto max-w-content px-7">
        <h2 className="mb-2 text-center font-serif text-[34px] font-medium text-ink">
          {t.aboutHeading}
        </h2>
        <p className="mb-10 text-center text-slate">{t.aboutSub}</p>

        <div className="relative">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => goTo(page - 1)}
            className="absolute -left-3.5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy text-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => goTo(page + 1)}
            className="absolute -right-3.5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy text-white"
          >
            ›
          </button>

          <div className="overflow-hidden">
            <div
              className="flex gap-5 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {Array.from({ length: pageCount }, (_, pageIndex) => (
                <div key={pageIndex} className="grid w-full flex-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                  {departmentHeads
                    .slice(pageIndex * CARDS_PER_PAGE, pageIndex * CARDS_PER_PAGE + CARDS_PER_PAGE)
                    .map((head) => (
                      <div key={head.name} className="overflow-hidden rounded-card bg-cream-card">
                        <div
                          className="flex items-center justify-center text-xs text-slate-muted"
                          style={{
                            aspectRatio: '4/3',
                            backgroundImage:
                              'repeating-linear-gradient(45deg, var(--color-tan) 0 10px, var(--color-tan-border) 10px 20px)',
                          }}
                        >
                          {head.photoUrl ? (
                            <img
                              src={head.photoUrl}
                              alt={head.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            lang === 'af' ? 'HOD foto' : 'HOD photo'
                          )}
                        </div>
                        <div className="p-4 text-center">
                          <div className="font-serif text-lg text-navy">{head.name}</div>
                          <div className="text-sm text-slate">{head.dept[lang]}</div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1}`}
              onClick={() => goTo(i)}
              className={
                i === page
                  ? 'h-2 w-6.5 rounded-pill bg-navy'
                  : 'h-2 w-2 rounded-pill bg-navy/25'
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

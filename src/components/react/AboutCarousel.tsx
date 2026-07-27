import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { departmentHeads } from '../../data/departmentHeads';

const AUTOPLAY_MS = 4200;
const GAP_PX = 20; // matches gap-5

export function AboutCarousel() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-card]');
    const step = card ? card.offsetWidth + GAP_PX : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollByCard(1);
      }
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nudge = (dir: 1 | -1) => {
    scrollByCard(dir);
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
            onClick={() => nudge(-1)}
            className="absolute -left-3.5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy text-white sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => nudge(1)}
            className="absolute -right-3.5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy text-white sm:flex"
          >
            ›
          </button>

          <div
            ref={trackRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-2"
          >
            {departmentHeads.map((head) => (
              <div
                key={head.id}
                data-card
                className="w-[72%] flex-none snap-start overflow-hidden rounded-card bg-cream-card sm:w-[45%] lg:w-[31%]"
              >
                <div
                  className="flex items-center justify-center text-xs text-slate-muted"
                  style={{
                    aspectRatio: '4/3',
                    backgroundImage:
                      'repeating-linear-gradient(45deg, var(--color-tan) 0 10px, var(--color-tan-border) 10px 20px)',
                  }}
                >
                  {head.photoUrl ? (
                    <img src={head.photoUrl} alt={head.name} className="h-full w-full object-cover" />
                  ) : lang === 'af' ? (
                    'HOD foto'
                  ) : (
                    'HOD photo'
                  )}
                </div>
                <div className="p-4 text-center">
                  <div className="font-serif text-lg text-navy">{head.name}</div>
                  {/* Stacked rather than joined: someone heading three
                      departments would otherwise wrap into an unreadable run. */}
                  <div className="mt-0.5 text-sm leading-snug text-slate">
                    {head.roles[lang].map((role) => (
                      <div key={role}>{role}</div>
                    ))}
                  </div>
                  {head.note && (
                    <div className="mt-2 text-xs leading-snug text-slate-muted">
                      {head.note[lang]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

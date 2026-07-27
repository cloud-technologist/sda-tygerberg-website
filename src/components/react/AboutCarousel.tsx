import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { departmentHeads } from '../../data/departmentHeads';

const AUTOPLAY_MS = 4200;
const GAP_PX = 20; // matches gap-5

/**
 * The roster is rendered three times over. The middle copy is the one you
 * normally look at; the outer two exist so there is always more track in both
 * directions than a single scroll can consume. Once scrolling settles, the
 * position is snapped back into the middle copy by exactly one set-width —
 * the same card sits under the same pixel, so the jump is invisible and the
 * carousel loops forever in either direction.
 *
 * Three is the minimum that works: with two copies, scrolling left from the
 * very start has nowhere to go.
 */
const COPIES = 3;
/** How long the track must be quiet before recentring, so we never fight a smooth scroll. */
const SETTLE_MS = 140;

export function AboutCarousel() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Width of one full copy of the roster, measured from the DOM rather than
   * derived from scrollWidth — the flex gaps make the arithmetic version
   * off-by-a-gap, and a drift of even one gap per lap is visible.
   */
  const setWidth = () => {
    const track = trackRef.current;
    if (!track) return 0;
    const cards = track.querySelectorAll<HTMLElement>('[data-card]');
    if (cards.length < departmentHeads.length + 1) return 0;
    return cards[departmentHeads.length].offsetLeft - cards[0].offsetLeft;
  };

  /** Move without animating, whatever `scroll-smooth` says — this jump must not be seen. */
  const jumpTo = (left: number) => {
    const track = trackRef.current;
    if (!track) return;
    const previous = track.style.scrollBehavior;
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = left;
    track.style.scrollBehavior = previous;
  };

  /**
   * Pull the scroll position back into the middle copy, keeping it inside
   * [0.5, 1.5) set-widths. `projected` lets a caller normalise for where a
   * scroll is *about* to land rather than where it currently is.
   */
  const recenter = (projected?: number) => {
    const track = trackRef.current;
    const width = setWidth();
    if (!track || width <= 0) return;
    const at = projected ?? track.scrollLeft;
    if (at < width * 0.5) jumpTo(track.scrollLeft + width);
    else if (at >= width * 1.5) jumpTo(track.scrollLeft - width);
  };

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-card]');
    const step = card ? card.offsetWidth + GAP_PX : track.clientWidth * 0.8;
    // Wrap *before* animating, based on where this step will land. Assigning
    // scrollLeft mid-animation cancels the smooth scroll in Chrome, so the
    // settle-based pass below can't be relied on while the buttons or
    // autoplay are firing faster than the track goes quiet — clicking Next
    // repeatedly would otherwise walk off the end of the tripled track.
    recenter(track.scrollLeft + dir * step);
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // No end to detect any more — recentring keeps the track inexhaustible.
    timerRef.current = setInterval(() => scrollByCard(1), AUTOPLAY_MS);
  };

  useEffect(() => {
    // Start on the middle copy. Identical content sits at both offsets, so
    // this is invisible even though it runs after hydration.
    const raf = requestAnimationFrame(() => jumpTo(setWidth()));
    resetTimer();
    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) clearInterval(timerRef.current);
      if (settleRef.current) clearTimeout(settleRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    if (settleRef.current) clearTimeout(settleRef.current);
    settleRef.current = setTimeout(recenter, SETTLE_MS);
  };

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
            onScroll={onScroll}
            className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-2"
          >
            {Array.from({ length: COPIES }, (_, copy) =>
              departmentHeads.map((head) => (
                <div
                  key={`${copy}-${head.id}`}
                  data-card
                  // Only the middle copy is read out; the other two are the
                  // same people again and would just triple the announcement.
                  aria-hidden={copy !== 1}
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
                      <img
                        src={head.photoUrl}
                        alt={head.name}
                        className="h-full w-full object-cover"
                      />
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
                  </div>
                </div>
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

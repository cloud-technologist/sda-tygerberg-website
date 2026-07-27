import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { departmentHeads, type DepartmentHead } from '../../data/departmentHeads';
import type { Lang } from '../../data/site';

const AUTOPLAY_MS = 4200;
const GAP_PX = 20;
const TRANSITION = 'transform 520ms cubic-bezier(.22,.61,.36,1)';
/** Drag further than this and letting go commits to the next/previous card. */
const SWIPE_COMMIT_PX = 60;

const COUNT = departmentHeads.length;

/**
 * Which slot a card occupies relative to the active one: 0 is the leftmost
 * visible card, positive slots run off to the right, negative off to the left.
 *
 * This function *is* the carousel. Every card's position is a pure function of
 * `active` in modular arithmetic, so the ring is genuinely circular in both
 * directions — there is no end to reach, no duplicated markup, and no
 * accumulated scroll offset that can drift out of alignment. Stepping past the
 * last card is just `(active + 1) % COUNT`.
 */
function slotOf(index: number, active: number) {
  const ahead = (((index - active) % COUNT) + COUNT) % COUNT;
  // Send the far half of the ring round the back, so cards leave to the left
  // as well as arriving from the right.
  return ahead > COUNT / 2 ? ahead - COUNT : ahead;
}

/**
 * Slots that can be on screen at some breakpoint (cards are 72% wide on
 * mobile, 31% on desktop). Only these animate: the one card per step that
 * wraps round the back of the ring jumps the full width of the roster, and
 * that jump must not be seen crossing the viewport.
 */
const isVisibleSlot = (slot: number) => slot >= -1 && slot <= 4;

const CARD_WIDTH = 'w-[72%] sm:w-[45%] lg:w-[31%]';

function Card({ head, lang }: { head: DepartmentHead; lang: Lang }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card bg-cream-card">
      <div
        className="flex flex-none items-center justify-center text-xs text-slate-muted"
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
        {/* Stacked rather than joined: someone heading three departments would
            otherwise wrap into an unreadable run. */}
        <div className="mt-0.5 text-sm leading-snug text-slate">
          {head.roles[lang].map((role) => (
            <div key={role}>{role}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AboutCarousel() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];

  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragFrom = useRef<number | null>(null);

  const step = (dir: 1 | -1) => setActive((a) => (((a + dir) % COUNT) + COUNT) % COUNT);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => step(1), AUTOPLAY_MS);
  };

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setReduceMotion(motion.matches);
      if (timerRef.current) clearInterval(timerRef.current);
      // Someone who has asked for less motion should not have the page
      // animating at them unprompted; the arrows still work.
      if (!motion.matches) resetTimer();
    };
    apply();
    motion.addEventListener('change', apply);
    return () => {
      motion.removeEventListener('change', apply);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    step(dir);
    if (!reduceMotion) resetTimer();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragFrom.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragFrom.current === null) return;
    setDrag(e.clientX - dragFrom.current);
  };

  const onPointerUp = () => {
    if (dragFrom.current === null) return;
    dragFrom.current = null;
    if (drag <= -SWIPE_COMMIT_PX) step(1);
    else if (drag >= SWIPE_COMMIT_PX) step(-1);
    setDrag(0);
    if (!reduceMotion) resetTimer();
  };

  // The tallest card in the current language, rendered invisibly in normal
  // flow: the real cards are absolutely positioned and so can't give the track
  // a height of its own.
  const tallest = departmentHeads.reduce((a, b) =>
    b.roles[lang].length > a.roles[lang].length ? b : a,
  );

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
            aria-roledescription="carousel"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            // Vertical panning stays with the page; horizontal is ours to read
            // as a swipe.
            className="relative touch-pan-y overflow-hidden pb-2"
          >
            <div aria-hidden className={`invisible ${CARD_WIDTH}`}>
              <Card head={tallest} lang={lang} />
            </div>

            {departmentHeads.map((head, index) => {
              const slot = slotOf(index, active);
              const animate = !drag && !reduceMotion && isVisibleSlot(slot);
              return (
                <div
                  key={head.id}
                  className={`absolute left-0 top-0 h-full ${CARD_WIDTH}`}
                  style={{
                    // `100%` is the card's own width, so the step stays correct
                    // at every breakpoint without measuring anything.
                    transform: `translateX(calc(${slot} * (100% + ${GAP_PX}px) + ${drag}px))`,
                    transition: animate ? TRANSITION : 'none',
                  }}
                >
                  <Card head={head} lang={lang} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

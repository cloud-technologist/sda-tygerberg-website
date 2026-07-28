import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { departmentHeads, type DepartmentHead } from '../../data/departmentHeads';
import type { Lang } from '../../data/site';

const AUTOPLAY_MS = 4200;
const GAP_PX = 20;
const TRANSITION = 'transform 520ms cubic-bezier(.22,.61,.36,1)';

/**
 * A gesture this brief is a flick: commit on its direction, whatever distance
 * it covered. Cards are most of the screen on a phone, so judging a flick on
 * distance means asking for a long deliberate drag — and silently swallowing
 * the quick thumb-flick people actually use.
 */
const FLICK_MS = 300;
/** Below this it is a tap or a jitter, however brief. */
const MIN_FLICK_PX = 10;
/** For anything slower, how much of a card must be covered to commit. */
const COMMIT_RATIO = 0.22;

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
 * Cards wrap round the back of the ring between slot -(COUNT/2 - 1) and
 * +COUNT/2, jumping the full width of the roster. That jump must never be
 * seen crossing the viewport, so anything out here moves without animating.
 * Everything comfortably inside does animate — wide enough that a multi-card
 * drag still slides its cards in and out rather than popping them.
 */
const ANIMATE_SPAN = Math.max(2, Math.floor(COUNT / 2) - 2);
const isAnimatedSlot = (slot: number) => slot >= -ANIMATE_SPAN && slot <= ANIMATE_SPAN;

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
  const [dragging, setDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragFrom = useRef<{ x: number; at: number } | null>(null);

  /**
   * How far the finger has travelled, written straight to the DOM as a custom
   * property the cards read.
   *
   * Deliberately not React state. State would re-render all twenty cards on
   * every pointermove, and on a phone React falls far enough behind the
   * gesture that the commit handler reads a distance of zero for a swipe that
   * plainly happened — the flick is then discarded as a tap.
   */
  const setOffset = (px: number) => {
    trackRef.current?.style.setProperty('--drag', `${px}px`);
  };

  const advance = (by: number) =>
    setActive((a) => (((a + by) % COUNT) + COUNT) % COUNT);
  const step = (dir: 1 | -1) => advance(dir);

  /** Distance one step moves: a card plus the gap after it. */
  const stepPx = () => {
    const card = trackRef.current?.querySelector<HTMLElement>('[data-card]');
    return card ? card.offsetWidth + GAP_PX : 0;
  };

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
    // `timeStamp` is when the browser saw the event, not when this handler got
    // to run. On a busy main thread those are far apart, and a flick judged on
    // handler time reads as a slow, deliberate drag and gets rejected.
    dragFrom.current = { x: e.clientX, at: e.timeStamp };
    setOffset(0);
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragFrom.current) return;
    setOffset(e.clientX - dragFrom.current.x);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const from = dragFrom.current;
    if (!from) return;
    dragFrom.current = null;

    // Both read off the event itself, so neither can lag behind the finger.
    const dx = e.clientX - from.x;
    const elapsed = e.timeStamp - from.at;
    const width = stepPx();
    setOffset(0);
    setDragging(false);

    if (width > 0) {
      // Land where the finger actually left off. Committing a single card no
      // matter how far the drag went makes a long swipe rubber-band backwards:
      // the cards track your thumb across three cards, then snap back to one.
      let by = Math.round(-dx / width);

      if (by === 0) {
        // Too short to round up to a card, but still deliberate — either a
        // quick flick, which never had time to cover the distance, or a slower
        // drag that got a decent way across.
        const flicked = elapsed < FLICK_MS && Math.abs(dx) > MIN_FLICK_PX;
        if (flicked || Math.abs(dx) > width * COMMIT_RATIO) by = dx < 0 ? 1 : -1;
      }

      if (by !== 0) advance(by);
    }

    if (!reduceMotion) resetTimer();
  };

  /**
   * The browser has claimed the gesture — a vertical page scroll, usually.
   * Snap back rather than commit: the visitor was not swiping the carousel.
   */
  const onPointerCancel = () => {
    dragFrom.current = null;
    setOffset(0);
    setDragging(false);
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
            ref={trackRef}
            aria-roledescription="carousel"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            // Vertical panning stays with the page; horizontal is ours to read
            // as a swipe.
            className="relative touch-pan-y overflow-hidden pb-2"
          >
            <div aria-hidden className={`invisible ${CARD_WIDTH}`}>
              <Card head={tallest} lang={lang} />
            </div>

            {departmentHeads.map((head, index) => {
              const slot = slotOf(index, active);
              const animate = !dragging && !reduceMotion && isAnimatedSlot(slot);
              return (
                <div
                  key={head.id}
                  data-card
                  className={`absolute left-0 top-0 h-full ${CARD_WIDTH}`}
                  style={{
                    // `100%` is the card's own width, so the step stays correct
                    // at every breakpoint without measuring anything. `--drag`
                    // is set on the track during a swipe, moving every card
                    // together without going back through React.
                    transform: `translateX(calc(${slot} * (100% + ${GAP_PX}px) + var(--drag, 0px)))`,
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

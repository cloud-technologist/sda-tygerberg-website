import { withBase } from '../../lib/base';
import { Logo } from './Logo';
import { LanguageToggle } from './LanguageToggle';

/**
 * Sticky header for the standalone pages (/beliefs, /connect, /bible-studies).
 * The homepage has its own (Header.tsx) with in-page anchor nav — these pages
 * are separate documents, so the only navigation they need is back home.
 *
 * `backHome` is passed in rather than read from a copy module because each
 * page keeps its own bilingual copy file.
 */
export function SubPageHeader({ backHome }: { backHome: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-subtle bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-content-narrow items-center justify-between gap-2 sm:gap-4 px-3 sm:px-7 py-2.5 sm:py-3.5">
        <a href={withBase('/')} className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
          <Logo />
          <div className="leading-tight min-w-0">
            <div className="font-serif text-base sm:text-lg font-semibold text-navy truncate">Tygerberg</div>
            <div className="hidden min-[400px]:block text-[8.5px] uppercase tracking-[.14em] text-slate-muted">
              SDA Kerk · Kaapstad
            </div>
          </div>
        </a>
        <a
          href={withBase('/')}
          className="h-8 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-pill border border-orange bg-orange/5 px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-bold text-navy hover:bg-orange hover:text-white transition-colors"
        >
          {backHome}
        </a>
        <LanguageToggle variant="light" />
      </div>
    </header>
  );
}

import { useLanguage } from '../../context/LanguageContext';
import { beliefsCopy } from '../../data/beliefsCopy';
import { withBase } from '../../lib/base';
import { Logo } from './Logo';
import { LanguageToggle } from './LanguageToggle';

export function BeliefsHeader() {
  const { lang } = useLanguage();
  const t = beliefsCopy[lang];

  return (
    <header className="sticky top-0 z-50 border-b border-subtle bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-content-narrow flex-wrap items-center justify-between gap-4 px-5 py-3">
        <a href={withBase('/')} className="flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold text-navy">Tygerberg</div>
            <div className="text-[8.5px] uppercase tracking-[.14em] text-slate-muted">
              SDA Kerk · Kaapstad
            </div>
          </div>
        </a>
        <a
          href={withBase('/')}
          className="inline-block rounded-pill bg-orange px-5.5 py-3 font-semibold text-white hover:bg-orange-hover"
        >
          ← {t.backHome}
        </a>
        <LanguageToggle />
      </div>
    </header>
  );
}

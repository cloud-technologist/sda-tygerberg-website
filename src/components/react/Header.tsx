import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { SITE } from '../../data/site';
import { Logo } from './Logo';
import { LanguageToggle } from './LanguageToggle';

type NavKey = 'navAbout' | 'navBeliefs' | 'navMinistries' | 'navVisit' | 'navConnect' | 'navResources';

const navLinks: { key: NavKey; href: string }[] = [
  { key: 'navAbout', href: '#oor' },
  { key: 'navBeliefs', href: '#glo' },
  { key: 'navMinistries', href: '#week' },
  { key: 'navVisit', href: '#besoek' },
  { key: 'navConnect', href: '#betrokke' },
  { key: 'navResources', href: '#hulpbronne' },
];

export function Header() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];

  return (
    <header className="sticky top-0 z-50 border-b border-subtle bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-5 py-3">
        <a href="#top" className="flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold text-navy">Tygerberg</div>
            <div className="text-[8.5px] uppercase tracking-[.14em] text-slate-muted">
              SDA Kerk · Kaapstad
            </div>
          </div>
        </a>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-ink hover:text-navy">
              {t[link.key]}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={SITE.directionsUrl}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 rounded-pill border border-strong px-3.5 py-2 text-xs font-semibold text-ink hover:border-navy hover:text-navy"
          >
            <span className="inline-block h-[7px] w-[7px] rotate-45 rounded-[0_50%_50%_50%] border-[1.5px] border-current" />
            {t.navDirections}
          </a>
          <LanguageToggle />
          <a
            href="#betrokke"
            className="rounded-pill bg-orange px-4.5 py-2 text-[13px] font-bold text-white hover:bg-orange-hover"
          >
            {t.give}
          </a>
        </div>
      </div>
    </header>
  );
}

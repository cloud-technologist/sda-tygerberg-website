import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { SERVICE_TIMES, SITE } from '../../data/site';
import { Logo } from './Logo';

export function Footer() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];

  return (
    <footer className="bg-navy-deep text-blue-pale">
      <div className="mx-auto grid max-w-content grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8 px-7 py-11">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <Logo size={30} ringColor="#cfe0e8" />
            <span className="font-serif text-base text-white">Tygerberg SDA</span>
          </div>
          <p className="text-sm">{t.footerBlurb}</p>
        </div>
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-blue-muted">
            {t.footerVisit}
          </div>
          <p className="mb-1 text-sm">{SITE.address}</p>
          <a href={`mailto:${SITE.contactEmail}`} className="text-sm text-orange hover:text-white">
            {SITE.contactEmail}
          </a>
        </div>
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-blue-muted">
            {t.footerTimesLabel}
          </div>
          {SERVICE_TIMES.map((entry) => (
            <div key={entry.en} className="text-sm">
              {entry[lang]} — {entry.time}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-content flex-wrap items-center gap-4 px-7 py-5 text-xs">
          <span>© {new Date().getFullYear()} Tygerberg SDA</span>
          <a href="https://cloudkid.link" target="_blank" rel="noopener" className="font-semibold text-orange hover:text-white">
            Created by Cloudkid Technologist ™ · cloudkid.link
          </a>
          <a href="https://adventist.org" target="_blank" rel="noopener" className="font-semibold text-orange hover:text-white">
            Part of the worldwide Adventist Church · adventist.org
          </a>
        </div>
      </div>
    </footer>
  );
}

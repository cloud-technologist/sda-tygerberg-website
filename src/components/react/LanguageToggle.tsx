import { useLanguage } from '../../context/LanguageContext';
import type { Lang } from '../../data/site';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  const pillClass = (active: boolean) =>
    `px-4 py-1.5 text-xs font-semibold transition-colors ${
      active ? 'bg-navy text-white' : 'bg-transparent text-slate hover:text-navy'
    }`;

  const pick = (l: Lang) => () => setLang(l);

  return (
    <div className="flex rounded-pill border border-strong overflow-hidden text-xs font-semibold">
      <button type="button" onClick={pick('af')} className={pillClass(lang === 'af')}>
        AF
      </button>
      <button type="button" onClick={pick('en')} className={pillClass(lang === 'en')}>
        EN
      </button>
    </div>
  );
}

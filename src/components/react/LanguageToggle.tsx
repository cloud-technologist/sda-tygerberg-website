import { useLanguage } from '../../context/LanguageContext';
import type { Lang } from '../../data/site';

type LanguageToggleProps = {
  variant?: 'light' | 'navy';
};

export function LanguageToggle({ variant = 'light' }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();
  const pick = (l: Lang) => () => setLang(l);

  const isNavy = variant === 'navy';

  const pillClass = (active: boolean) =>
    `h-full inline-flex items-center justify-center px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-bold transition-colors shrink-0 ${
      active
        ? 'bg-orange text-white'
        : isNavy
        ? 'bg-transparent text-orange hover:bg-orange/20'
        : 'bg-transparent text-navy hover:bg-orange/10 hover:text-orange'
    }`;

  return (
    <div
      className={`h-8 inline-flex shrink-0 flex-none items-center rounded-pill border border-orange overflow-hidden text-[11px] sm:text-xs font-bold ${
        isNavy ? 'bg-orange/10' : 'bg-orange/5'
      }`}
    >
      <button type="button" onClick={pick('af')} className={pillClass(lang === 'af')}>
        AF
      </button>
      <button type="button" onClick={pick('en')} className={pillClass(lang === 'en')}>
        EN
      </button>
    </div>
  );
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from '../data/site';

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'tygerberg-lang';
const DEFAULT_LANG: Lang = 'af';

function isLang(value: unknown): value is Lang {
  return value === 'af' || value === 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always starts at the default so the client's first render matches the
  // statically pre-rendered HTML; the stored choice is applied on mount.
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  // Home and /beliefs are separate documents with separate React roots, so
  // without this the language toggle resets every time you navigate between
  // them (pick English on the home page, land back on Afrikaans in beliefs).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(stored) && stored !== lang) setLang(stored);
    } catch {
      // Private mode / storage disabled — fall back to the default language.
    }
    // Runs once on mount; `lang` is only read to avoid a redundant setState.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Kept out of the try below on purpose. This can't throw, and grouping it
    // with localStorage meant that blocked site data (Safari private mode)
    // skipped it too — leaving English content announced with Afrikaans
    // pronunciation, which is the one part here that actually matters.
    document.documentElement.lang = lang;

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore — persistence is a convenience, not required for the site to work.
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

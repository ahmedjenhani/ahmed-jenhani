import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CONTENT, type Content, type Lang } from '../content';
import { readStorage, writeStorage } from './storage';

const KEY = 'portfolio.lang';

export const isLang = (value: unknown): value is Lang => value === 'en' || value === 'fr';

/** The saved choice wins; otherwise French for visitors whose browser is set to French, English for everyone else. */
export function detectLanguage(saved: string | null, browserLanguages: readonly string[]): Lang {
  if (isLang(saved)) {
    return saved;
  }
  return browserLanguages.some((l) => l.toLowerCase().startsWith('fr')) ? 'fr' : 'en';
}

interface I18nValue {
  lang: Lang;
  t: Content;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    detectLanguage(readStorage(KEY), typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language])),
  );

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeStorage(KEY, next);
  }, []);

  const t = CONTENT[lang];

  // keep the document in step with the language: screen readers, the browser tab and search previews
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
  }, [lang, t]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return ctx;
}

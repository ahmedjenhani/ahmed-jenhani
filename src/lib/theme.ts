import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from './storage';

const KEY = 'portfolio.theme';
export type Theme = 'light' | 'dark';

/** The saved choice wins; otherwise follow the visitor's system setting. */
export function initialTheme(saved: string | null, systemPrefersDark: boolean): Theme {
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return systemPrefersDark ? 'dark' : 'light';
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() =>
    initialTheme(readStorage(KEY), window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      writeStorage(KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

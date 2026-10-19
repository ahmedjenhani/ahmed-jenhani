import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CONTENT } from '../content';
import { I18nProvider, detectLanguage, useI18n } from './i18n';
import { initialTheme, useTheme } from './theme';

describe('detectLanguage', () => {
  it('prefers the saved choice over the browser', () => {
    expect(detectLanguage('en', ['fr-FR'])).toBe('en');
    expect(detectLanguage('fr', ['en-US'])).toBe('fr');
  });

  it('uses French for French browsers and English for everything else', () => {
    expect(detectLanguage(null, ['fr-TN', 'en'])).toBe('fr');
    expect(detectLanguage(null, ['en-US', 'de'])).toBe('en');
    expect(detectLanguage(null, [])).toBe('en');
  });

  it('ignores a corrupted saved value', () => {
    expect(detectLanguage('klingon', ['fr'])).toBe('fr');
  });
});

describe('initialTheme', () => {
  it('prefers the saved choice, then the system setting', () => {
    expect(initialTheme('light', true)).toBe('light');
    expect(initialTheme('dark', false)).toBe('dark');
    expect(initialTheme(null, true)).toBe('dark');
    expect(initialTheme('junk', false)).toBe('light');
  });
});

function Probe() {
  const { lang, t, setLang } = useI18n();
  return (
    <div>
      <p data-testid="title">{t.meta.title}</p>
      <p data-testid="lang">{lang}</p>
      <button onClick={() => setLang('fr')}>fr</button>
    </div>
  );
}

describe('I18nProvider', () => {
  it('switches language, remembers it and updates the document', async () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    await userEvent.click(screen.getByText('fr'));
    expect(screen.getByTestId('lang')).toHaveTextContent('fr');
    expect(screen.getByTestId('title')).toHaveTextContent(CONTENT.fr.meta.title);
    expect(document.documentElement.lang).toBe('fr');
    expect(document.title).toBe(CONTENT.fr.meta.title);
    expect(localStorage.getItem('portfolio.lang')).toBe('fr');
  });

  it('refuses to be used outside its provider', () => {
    expect(() => render(<Probe />)).toThrow(/I18nProvider/);
  });
});

describe('useTheme', () => {
  it('toggles the dark class and remembers the choice', () => {
    localStorage.setItem('portfolio.theme', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('portfolio.theme')).toBe('dark');
  });
});

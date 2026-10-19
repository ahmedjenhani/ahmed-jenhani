import { useState } from 'react';
import type { Lang } from '../content';
import { useScrolled, useScrollSpy } from '../lib/hooks';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { SECTION_IDS } from '../site';
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from './icons';
import { cn } from './ui';

const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'fr', label: 'FR', name: 'Français' },
];

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const active = useScrollSpy();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  const link = (id: (typeof SECTION_IDS)[number]) => (
    <a
      key={id}
      href={`#${id}`}
      onClick={() => setOpen(false)}
      aria-current={active === id ? 'true' : undefined}
      data-testid={`nav-${id}`}
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active === id ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink',
      )}
    >
      {t.nav[id]}
    </a>
  );

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open ? 'border-b border-line bg-bg/85 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-5">
        <a href="#home" className="mr-auto flex items-center gap-2.5 font-bold tracking-tight" aria-label="Ahmed Jenhani">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-sm font-extrabold text-white">
            AJ
          </span>
          <span className="hidden sm:inline">Ahmed Jenhani</span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {SECTION_IDS.map(link)}
        </nav>

        <div role="group" aria-label={t.a11y.language} className="ml-2 flex rounded-xl border border-line bg-surface p-0.5">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              lang={l.id}
              title={l.name}
              aria-pressed={lang === l.id}
              onClick={() => setLang(l.id)}
              data-testid={`lang-${l.id}`}
              className={cn(
                'rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold transition-colors',
                lang === l.id ? 'bg-accent/15 text-accent' : 'text-muted hover:text-ink',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={theme === 'dark' ? t.a11y.theme.toLight : t.a11y.theme.toDark}
          data-testid="theme-toggle"
          className="rounded-xl border border-line bg-surface p-2.5 text-muted transition-colors hover:text-ink"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.a11y.menuClose : t.a11y.menuOpen}
          data-testid="menu-toggle"
          className="rounded-xl border border-line bg-surface p-2.5 text-muted transition-colors hover:text-ink lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main" className="border-t border-line bg-bg/95 px-5 pb-4 pt-2 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col">{SECTION_IDS.map(link)}</div>
        </nav>
      )}
    </header>
  );
}

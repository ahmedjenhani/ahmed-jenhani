import { useI18n } from '../lib/i18n';
import { SITE } from '../site';
import { ArrowUpIcon, GithubIcon, LinkedinIcon, MailIcon } from './icons';

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const icon = 'rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-accent';

  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-sm text-muted">{t.footer.built}</p>
          <p className="mt-1 text-xs text-muted">© {year} Ahmed Jenhani</p>
        </div>
        <div className="flex items-center gap-1">
          <a href={SITE.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={icon}>
            <GithubIcon />
          </a>
          <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={icon}>
            <LinkedinIcon />
          </a>
          <a href={`mailto:${SITE.email}`} aria-label="Email" className={icon}>
            <MailIcon />
          </a>
          <a
            href="#home"
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
          >
            <ArrowUpIcon width={16} height={16} /> {t.footer.top}
          </a>
        </div>
      </div>
    </footer>
  );
}

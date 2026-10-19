import { CERTIFICATIONS, SITE } from '../site';
import { useI18n } from '../lib/i18n';
import { DownloadIcon, GithubIcon, LinkedinIcon, MailIcon, PinIcon } from './icons';
import { ButtonLink } from './ui';

export function Hero() {
  const { t } = useI18n();
  const h = t.hero;
  const stats = [
    { value: '3', label: h.stats.internships },
    { value: '2', label: h.stats.liveApps },
    { value: String(CERTIFICATIONS.length), label: h.stats.certifications },
  ];

  return (
    <section id="home" aria-labelledby="home-title" className="relative flex min-h-screen items-center pt-24 pb-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium" data-testid="status">
            <span className="relative flex h-2.5 w-2.5">
              <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            {h.status}
          </p>

          <p className="mt-8 font-mono text-base text-muted">{h.greeting}</p>
          <h1 id="home-title" className="mt-1 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text">{SITE.name}</span>
          </h1>
          <p className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">{h.role}</p>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{h.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={SITE.cv} download="Ahmed-Jenhani-CV.pdf" data-testid="download-cv">
              <DownloadIcon /> {h.downloadCv}
            </ButtonLink>
            <ButtonLink href="#contact" variant="secondary">
              <MailIcon /> {h.contact}
            </ButtonLink>
            <ButtonLink href="#projects" variant="ghost">
              {h.projects} →
            </ButtonLink>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-xl border border-line bg-surface p-3 text-muted transition hover:border-accent hover:text-accent"
            >
              <GithubIcon />
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-xl border border-line bg-surface p-3 text-muted transition hover:border-accent hover:text-accent"
            >
              <LinkedinIcon />
            </a>
            <a
              href={`mailto:${SITE.email}`}
              aria-label="Email"
              className="rounded-xl border border-line bg-surface p-3 text-muted transition hover:border-accent hover:text-accent"
            >
              <MailIcon />
            </a>
            <span className="ml-3 inline-flex items-center gap-1.5 text-sm text-muted">
              <PinIcon width={16} height={16} /> {h.location}
            </span>
          </div>

          <dl className="mt-10 flex gap-8 border-t border-line pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-3xl font-extrabold tracking-tight">{s.value}</dd>
                <p className="mt-0.5 text-sm text-muted" aria-hidden="true">
                  {s.label}
                </p>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-violet-600/30 via-blue-500/20 to-cyan-400/30 blur-2xl" aria-hidden="true" />
          <div className="relative rounded-[2rem] bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-[3px] shadow-2xl">
            <div className="overflow-hidden rounded-[calc(2rem-3px)] bg-surface">
              <img
                src={SITE.photo}
                alt={h.photoAlt}
                width={300}
                height={296}
                fetchPriority="high"
                className="aspect-[4/4.6] w-full object-cover object-top"
              />
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-xl backdrop-blur sm:block">
            <p className="font-mono text-xs text-muted">ITBS · Nabeul</p>
            <p className="text-sm font-semibold">{h.badge}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

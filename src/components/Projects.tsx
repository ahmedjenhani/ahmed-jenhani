import type { ProjectText } from '../content';
import { PROJECT_FACTS, type ProjectFacts } from '../site';
import { useI18n } from '../lib/i18n';
import { CodeIcon, ExternalIcon } from './icons';
import { ButtonLink, Card, Chip, Reveal, Section, cn } from './ui';

function Links({ facts, name }: { facts: ProjectFacts; name: string }) {
  const { t } = useI18n();
  if (!facts.live && !facts.code) {
    return <p className="text-sm text-muted">{t.projects.noLinks}</p>;
  }
  return (
    <div className="flex flex-wrap gap-3">
      {facts.live && (
        <ButtonLink href={facts.live} external data-testid={`live-${facts.id}`} aria-label={`${t.projects.live}: ${name}`}>
          <ExternalIcon width={18} height={18} /> {t.projects.live}
        </ButtonLink>
      )}
      {facts.code && (
        <ButtonLink href={facts.code} external variant="secondary" data-testid={`code-${facts.id}`} aria-label={`${t.projects.code}: ${name}`}>
          <CodeIcon width={18} height={18} /> {t.projects.code}
        </ButtonLink>
      )}
    </div>
  );
}

function Highlights({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-2 text-sm text-muted">
      {items.map((h) => (
        <li key={h} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{h}</span>
        </li>
      ))}
    </ul>
  );
}

function TechChips({ tech }: { tech: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
      {tech.map((x) => (
        <li key={x}>
          <Chip>{x}</Chip>
        </li>
      ))}
    </ul>
  );
}

/** A big card for the two applications that are live on the web: a screenshot in a browser frame, and the story. */
function FeaturedProject({ text, facts, flip }: { text: ProjectText; facts: ProjectFacts; flip: boolean }) {
  const { t } = useI18n();
  return (
    <Reveal>
      <article
        data-testid={`project-${facts.id}`}
        className="grid items-center gap-8 rounded-3xl border border-line bg-surface p-5 shadow-sm transition-colors md:p-8 lg:grid-cols-2 lg:gap-12"
      >
        <div className={cn('min-w-0', flip && 'lg:order-2')}>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 min-w-0 flex-1 truncate rounded-md bg-bg px-3 py-0.5 font-mono text-[11px] text-muted">
                {facts.live?.replace('https://', '')}
              </span>
            </div>
            {facts.image && (
              <img
                src={facts.image}
                alt={`${t.projects.screenshotAlt} ${text.title}`}
                loading="lazy"
                decoding="async"
                width={1360}
                height={860}
                className="aspect-[16/10] w-full object-cover object-top"
              />
            )}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-sm text-accent">{text.kicker}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> {t.projects.featured}
            </span>
          </div>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{text.title}</h3>
          <p className="mt-3 leading-relaxed text-muted">{text.description}</p>
          <Highlights items={text.highlights} />
          <TechChips tech={facts.tech} />
          <div className="mt-6">
            <Links facts={facts} name={text.title} />
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function CompactProject({ text, facts, index }: { text: ProjectText; facts: ProjectFacts; index: number }) {
  return (
    <Reveal delay={index * 80} className="h-full">
      <Card className="flex h-full flex-col transition hover:-translate-y-1 hover:border-accent/60">
        <article data-testid={`project-${facts.id}`} className="flex h-full flex-col">
          <div className="-mx-6 -mt-6 mb-5 h-1.5 rounded-t-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500" aria-hidden="true" />
          <p className="font-mono text-xs text-accent">{text.kicker}</p>
          <h3 className="mt-2 text-xl font-bold">{text.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{text.description}</p>
          <Highlights items={text.highlights} />
          <TechChips tech={facts.tech} />
          <div className="mt-auto pt-6">
            <Links facts={facts} name={text.title} />
          </div>
        </article>
      </Card>
    </Reveal>
  );
}

export function Projects() {
  const { t } = useI18n();
  const items = t.projects.items
    .map((text) => ({ text, facts: PROJECT_FACTS.find((f) => f.id === text.id) }))
    .filter((x): x is { text: ProjectText; facts: ProjectFacts } => x.facts !== undefined);
  const featured = items.filter((x) => x.facts.featured);
  const others = items.filter((x) => !x.facts.featured);

  return (
    <Section id="projects" number={3} eyebrow={t.nav.projects} title={t.projects.title} subtitle={t.projects.subtitle}>
      <div className="space-y-8">
        {featured.map((x, i) => (
          <FeaturedProject key={x.facts.id} text={x.text} facts={x.facts} flip={i % 2 === 1} />
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {others.map((x, i) => (
          <CompactProject key={x.facts.id} text={x.text} facts={x.facts} index={i} />
        ))}
      </div>
    </Section>
  );
}

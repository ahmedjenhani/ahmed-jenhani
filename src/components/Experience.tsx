import { EXPERIENCE_TECH } from '../site';
import { useI18n } from '../lib/i18n';
import { BriefcaseIcon } from './icons';
import { Chip, Reveal, Section } from './ui';

export function Experience() {
  const { t } = useI18n();
  const e = t.experience;

  return (
    <Section id="experience" number={4} eyebrow={t.nav.experience} title={e.title} subtitle={e.subtitle}>
      <ol className="relative space-y-8 border-l-2 border-line pl-8 md:pl-10">
        {e.items.map((item, i) => (
          <li key={item.id} className="relative" data-testid={`experience-${item.id}`}>
            <span
              className="absolute -left-[46px] top-6 grid h-8 w-8 place-items-center rounded-full border-2 border-accent bg-bg text-accent md:-left-[54px]"
              aria-hidden="true"
            >
              <BriefcaseIcon width={15} height={15} />
            </span>
            <Reveal delay={i * 80}>
              <article className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-colors md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
                  <div>
                    <h3 className="text-xl font-bold">{item.role}</h3>
                    <p className="font-semibold text-accent">{item.company}</p>
                  </div>
                  <p className="text-right text-sm text-muted">
                    <span className="font-mono">{item.period}</span>
                    <br />
                    {item.place}
                  </p>
                </div>
                <p className="mt-3 text-sm font-medium">{item.project}</p>
                <ul className="mt-4 space-y-2.5 text-muted">
                  {item.bullets.map((b) => (
                    <li key={b.slice(0, 32)} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
                  {(EXPERIENCE_TECH[item.id] ?? []).map((tech) => (
                    <li key={tech}>
                      <Chip>{tech}</Chip>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

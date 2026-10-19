import { SKILL_GROUPS } from '../site';
import { useI18n } from '../lib/i18n';
import { Card, Chip, Reveal, Section } from './ui';

export function Skills() {
  const { t } = useI18n();
  const s = t.skills;

  return (
    <Section id="skills" number={2} eyebrow={t.nav.skills} title={s.title} subtitle={s.subtitle}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SKILL_GROUPS.map((group, i) => (
          <Reveal key={group.id} delay={i * 60}>
            <Card className="h-full transition hover:-translate-y-1 hover:border-accent/60">
              <h3 className="mb-4 text-lg font-semibold">{s.groups[group.id]}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <Chip>{item}</Chip>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10">
        <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-muted">{s.practices.title}</h3>
        <ul className="flex flex-wrap justify-center gap-3">
          {s.practices.items.map((p) => (
            <li key={p}>
              <Chip tone="accent">{p}</Chip>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}

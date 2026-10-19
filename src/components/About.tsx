import { CERTIFICATIONS } from '../site';
import { useI18n } from '../lib/i18n';
import { AcademicIcon, CheckIcon } from './icons';
import { Card, Reveal, Section } from './ui';

export function About() {
  const { t } = useI18n();
  const a = t.about;

  return (
    <Section id="about" number={1} eyebrow={t.nav.about} title={a.title}>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="space-y-5 text-lg leading-relaxed text-muted">
          {a.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </Reveal>

        <Reveal delay={120} className="space-y-5">
          <Card>
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold">
              <AcademicIcon className="text-accent" /> {a.education.title}
            </h3>
            <ol className="relative space-y-6 border-l border-line pl-6">
              {a.education.items.map((item) => (
                <li key={item.school} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg" aria-hidden="true" />
                  <p className="font-mono text-xs text-accent">{item.period}</p>
                  <p className="mt-1 font-semibold">{item.school}</p>
                  <p className="text-sm text-muted">{item.degree}</p>
                  <p className="text-sm text-muted">{item.place}</p>
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-lg font-semibold">{a.languages.title}</h3>
              <ul className="space-y-2 text-sm">
                {a.languages.items.map((l) => (
                  <li key={l.name} className="flex items-center justify-between gap-3">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-muted">{l.level}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3 className="mb-3 text-lg font-semibold">{a.volunteering.title}</h3>
              <p className="text-sm text-muted">{a.volunteering.text}</p>
            </Card>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-14">
        <h3 className="mb-5 text-xl font-semibold">{a.certifications}</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="certifications">
          {CERTIFICATIONS.map((c) => (
            <li key={c} className="flex gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
              <CheckIcon className="mt-0.5 shrink-0 text-accent-2" width={18} height={18} />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}

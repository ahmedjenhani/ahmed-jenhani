import { describe, expect, it } from 'vitest';
import { CONTENT } from './content';
import { PROJECT_FACTS, SECTION_IDS, SITE } from './site';

/** Every path to a leaf in the object, with array lengths, so two languages can be compared for shape. */
function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k));
  }
  return [path];
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('content', () => {
  it('has the same structure in English and French', () => {
    expect(shape(CONTENT.fr)).toEqual(shape(CONTENT.en));
  });

  it.each(['en', 'fr'] as const)('has no empty text in %s', (lang) => {
    for (const text of strings(CONTENT[lang])) {
      expect(text.trim()).not.toBe('');
    }
  });

  it('has an English and a French text for every project', () => {
    for (const lang of ['en', 'fr'] as const) {
      expect(CONTENT[lang].projects.items.map((p) => p.id)).toEqual(PROJECT_FACTS.map((p) => p.id));
    }
  });

  it('keeps one nav label per section', () => {
    for (const lang of ['en', 'fr'] as const) {
      for (const id of SECTION_IDS) {
        expect(CONTENT[lang].nav[id as keyof (typeof CONTENT)['en']['nav']]).toBeTruthy();
      }
    }
  });
});

describe('site facts', () => {
  it('shows the two deployed apps first as featured projects with a live link, a repo and a screenshot', () => {
    const featured = PROJECT_FACTS.filter((p) => p.featured);
    expect(featured.map((p) => p.id).sort()).toEqual(['jobtracker', 'retrolive']);
    for (const p of featured) {
      expect(p.live).toMatch(/^https:\/\//);
      expect(p.code).toMatch(/^https:\/\/github\.com\/ahmedjenhani\//);
      expect(p.image).toMatch(/^\/projects\/.+\.png$/);
    }
  });

  it('only uses https links', () => {
    const links = [SITE.github, SITE.linkedin, ...PROJECT_FACTS.flatMap((p) => [p.live, p.code])].filter(Boolean) as string[];
    for (const link of links) {
      expect(link).toMatch(/^https:\/\//);
    }
  });

  it('publishes the phone number from the CV', () => {
    expect(SITE.phone).toBe('+216 50 107 126');
  });

  it('links the ITBS Network Security repository', () => {
    expect(PROJECT_FACTS.find((p) => p.id === 'phishing')?.code).toBe('https://github.com/ahmedjenhani/ITBSNetworksecurity2');
  });
});

describe('internship search', () => {
  it('says it is a 4 to 6 month PFE available from 15 January 2027, in both languages', () => {
    expect(CONTENT.en.hero.pfe).toMatchObject({ duration: '4 to 6 months', availability: '15 January 2027', availabilityDate: '2027-01-15' });
    expect(CONTENT.fr.hero.pfe).toMatchObject({ duration: '4 à 6 mois', availability: '15 janvier 2027', availabilityDate: '2027-01-15' });
    expect(CONTENT.fr.hero.status).toContain("stage de projet de fin d'études (PFE)");
    expect(CONTENT.en.hero.status).toContain('(PFE)');
  });

  it('shows both locations', () => {
    for (const lang of ['en', 'fr'] as const) {
      expect(CONTENT[lang].hero.location).toContain('Nabeul');
      expect(CONTENT[lang].hero.location).toContain('Tunis, Tunisi');
      expect(CONTENT[lang].contact.info.locationValue).toContain('Tunis, Tunisi');
    }
  });

  it('never says the source code is "available on request"', () => {
    expect(strings(CONTENT).join('\n')).not.toMatch(/on request|sur demande/i);
  });
});

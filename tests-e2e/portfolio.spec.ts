import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Collects anything the page logs as an error, so a broken image or a thrown exception fails the test. */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('response', (r) => r.status() >= 400 && errors.push(`http ${r.status()}: ${r.url()}`));
  return errors;
}

async function open(page: Page, lang: 'en' | 'fr' = 'en', theme: 'light' | 'dark' = 'dark') {
  await page.addInitScript(
    ([l, t]) => {
      // seed only a first visit, so a choice the test makes survives its own reload
      if (localStorage.getItem('portfolio.lang') === null) localStorage.setItem('portfolio.lang', l);
      if (localStorage.getItem('portfolio.theme') === null) localStorage.setItem('portfolio.theme', t);
    },
    [lang, theme],
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

/** Scroll the whole page in small steps so every reveal-on-scroll block has been shown. */
async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 300) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(30);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

test.describe('content', () => {
  test('shows the name, the role and no console errors', async ({ page }) => {
    const errors = watchErrors(page);
    await open(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ahmed');
    await scrollThrough(page);
    expect(errors).toEqual([]);
  });

  test('presents the two deployed projects with live links, code links and screenshots', async ({ page }) => {
    await open(page);
    for (const id of ['retrolive', 'jobtracker']) {
      const card = page.getByTestId(`project-${id}`);
      await card.scrollIntoViewIfNeeded();
      await expect(card.getByRole('img')).toBeVisible();
      const live = page.getByTestId(`live-${id}`);
      await expect(live).toHaveAttribute('href', /^https:\/\/.+\.vercel\.app/);
      await expect(live).toHaveAttribute('target', '_blank');
      await expect(live).toHaveAttribute('rel', /noopener/);
      await expect(page.getByTestId(`code-${id}`)).toHaveAttribute('href', /^https:\/\/github\.com\/ahmedjenhani\//);
      // the screenshot really loaded, not just a broken image box
      expect(await card.getByRole('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(100);
    }
  });

  test('says it is looking for a 4 to 6 month PFE from 15 January 2027', async ({ page }) => {
    await open(page, 'en');
    await expect(page.getByTestId('status')).toContainText('graduation internship (PFE)');
    await expect(page.getByTestId('pfe')).toContainText('4 to 6 months');
    await expect(page.getByTestId('pfe').locator('time')).toHaveAttribute('datetime', '2027-01-15');
    await page.getByTestId('lang-fr').click();
    await expect(page.getByTestId('status')).toContainText("stage de projet de fin d'études (PFE)");
    await expect(page.getByTestId('pfe')).toContainText('4 à 6 mois');
    await expect(page.getByTestId('pfe')).toContainText('15 janvier 2027');
  });

  test('shows both locations and the phone number from the CV', async ({ page }) => {
    await open(page, 'en');
    await expect(page.locator('#home')).toContainText('Nabeul or Tunis, Tunisia');
    await expect(page.locator('#contact')).toContainText('Nabeul or Tunis, Tunisia');
    await expect(page.getByTestId('phone-link')).toHaveAttribute('href', 'tel:+21650107126');
    await expect(page.getByTestId('phone-link')).toContainText('+216 50 107 126');
  });

  test('links the ITBS Network Security repository and has no "on request" text', async ({ page }) => {
    await open(page, 'en');
    await expect(page.getByTestId('code-phishing')).toHaveAttribute('href', 'https://github.com/ahmedjenhani/ITBSNetworksecurity2');
    await expect(page.locator('#projects')).not.toContainText(/on request/i);
    await page.getByTestId('lang-fr').click();
    await expect(page.locator('#projects')).not.toContainText(/sur demande/i);
  });

  test('lists every experience and certification', async ({ page }) => {
    await open(page);
    for (const id of ['dr_sina', 'main_form', 'elboita']) {
      await expect(page.getByTestId(`experience-${id}`)).toBeAttached();
    }
    await expect(page.getByTestId('certifications').locator('li')).toHaveCount(8);
  });

  test('the CV download is a real PDF', async ({ page, request }) => {
    await open(page);
    const link = page.getByTestId('download-cv');
    await expect(link).toHaveAttribute('download', /.*/);
    const href = await link.getAttribute('href');
    const response = await request.get(href as string);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('pdf');
    expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');
  });
});

test.describe('preferences', () => {
  test('switches to French, translates the page and remembers the choice', async ({ page }) => {
    await open(page, 'en');
    await page.getByTestId('lang-fr').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByTestId('nav-projects')).toHaveText('Projets');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByTestId('lang-fr')).toHaveAttribute('aria-pressed', 'true');
  });

  test('French browsers get French by default', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'fr-FR' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await context.close();
  });

  test('toggles the theme and remembers it', async ({ page }) => {
    await open(page, 'en', 'dark');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});

test.describe('navigation', () => {
  test('navbar links scroll to their section and highlight it', async ({ page }) => {
    await open(page);
    await page.getByTestId('nav-projects').click();
    await expect(page.locator('#projects')).toBeInViewport();
    await expect(page.getByTestId('nav-projects')).toHaveAttribute('aria-current', 'true');
  });
});

test.describe('contact form', () => {
  test('explains what is missing', async ({ page }) => {
    await open(page);
    await page.getByTestId('contact-send').click();
    await expect(page.getByRole('alert')).toHaveCount(3);
  });

  test('opens the visitor mail app with the message filled in', async ({ page }) => {
    await open(page);
    // a mailto: navigation is handed to the mail app and the page stays where it is
    await page.getByTestId('contact-name').fill('Sara Ben Ali');
    await page.getByTestId('contact-email').fill('sara@example.com');
    await page.getByTestId('contact-message').fill('Hello Ahmed, we have an internship for you.');
    await page.getByTestId('contact-send').click();
    await expect(page.getByTestId('contact-status')).toContainText(/mail app/i);
    await expect(page.getByTestId('contact-name')).toHaveValue('Sara Ben Ali');
  });
});

test.describe('quality', () => {
  for (const theme of ['dark', 'light'] as const) {
    for (const lang of ['en', 'fr'] as const) {
      test(`has no accessibility violations (${lang}, ${theme})`, async ({ page }) => {
        await open(page, lang, theme);
        await scrollThrough(page);
        await page.waitForTimeout(600); // let the reveal transitions finish so contrast is measured on the final colours
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      });
    }
  }

  for (const width of [390, 320]) {
    test(`does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await open(page, 'fr');
      await scrollThrough(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await expect(page.getByTestId('menu-toggle')).toBeInViewport({ ratio: 1 });
    });
  }

  test('the mobile menu opens, navigates and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await open(page);
    await page.getByTestId('menu-toggle').click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await page.locator('#mobile-menu').getByTestId('nav-contact').click();
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('ships the metadata search engines and link previews need', async ({ page, request }) => {
    await open(page);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Ahmed Jenhani/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.png$/);
    const og = await request.get('/og.png');
    expect(og.ok()).toBe(true);
    expect((await request.get('/robots.txt')).ok()).toBe(true);
    expect((await request.get('/favicon.svg')).ok()).toBe(true);
  });
});

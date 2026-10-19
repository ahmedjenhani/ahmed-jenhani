import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

/**
 * The assistant tests answer /api/ask themselves, so they are fast, free and do not depend on the AI service.
 * One test at the end talks to the real model; it only runs when LIVE_AI=1 (against a server that has the key).
 */

async function open(page: Page, lang: 'en' | 'fr' = 'en', theme: 'light' | 'dark' = 'dark') {
  await page.addInitScript(
    ([l, t]) => {
      if (localStorage.getItem('portfolio.lang') === null) localStorage.setItem('portfolio.lang', l);
      if (localStorage.getItem('portfolio.theme') === null) localStorage.setItem('portfolio.theme', t);
    },
    [lang, theme],
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

/** Answers every question and remembers what the page sent. */
async function answerWith(page: Page, status: number, body: unknown) {
  const requests: { lang: string; messages: { role: string; text: string }[] }[] = [];
  await page.route('**/api/ask', (route) => {
    requests.push(route.request().postDataJSON());
    return json(route, status, body);
  });
  return requests;
}

test.describe('AI assistant', () => {
  test('opens from the button, greets the visitor, and closes with Escape', async ({ page }) => {
    await open(page);
    await page.getByTestId('assistant-launcher').click();
    const panel = page.getByTestId('assistant-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('AI assistant');
    await expect(page.getByTestId('assistant-input')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(page.getByTestId('assistant-launcher')).toBeFocused();
  });

  test('answers a suggested question', async ({ page }) => {
    const requests = await answerWith(page, 200, { answer: 'Ahmed is looking for a PFE of 4 to 6 months.' });
    await open(page);
    await page.getByTestId('assistant-launcher').click();
    await page.getByTestId('assistant-suggestion-0').click();

    await expect(page.getByTestId('assistant-message-assistant')).toHaveText('Ahmed is looking for a PFE of 4 to 6 months.');
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ lang: 'en', messages: [{ role: 'user', text: 'What kind of internship is Ahmed looking for?' }] });
  });

  test('answers a typed question in French and says so to the server', async ({ page }) => {
    const requests = await answerWith(page, 200, { answer: 'Ahmed cherche un stage PFE.' });
    await open(page, 'fr');
    await page.getByTestId('assistant-launcher').click();
    await page.getByTestId('assistant-input').fill('Connaît-il Docker ?');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('assistant-message-assistant')).toHaveText('Ahmed cherche un stage PFE.');
    expect(requests[0]).toMatchObject({ lang: 'fr' });
    await expect(page.getByTestId('assistant-panel')).toContainText('Assistant IA');
  });

  test('keeps the conversation going with the earlier turns', async ({ page }) => {
    const requests = await answerWith(page, 200, { answer: 'An answer.' });
    await open(page);
    await page.getByTestId('assistant-launcher').click();
    await page.getByTestId('assistant-input').fill('First question');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('assistant-message-assistant')).toHaveCount(1);
    await page.getByTestId('assistant-input').fill('Second question');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('assistant-message-assistant')).toHaveCount(2);
    expect(requests[1]?.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
  });

  for (const [name, status, body, text] of [
    ['too many questions', 429, { error: 'rate_limited', retryAfterSeconds: 60 }, /wait a moment/i],
    ['the AI quota used up', 503, { error: 'busy' }, /quota is used up/i],
    ['the service down', 503, { error: 'unavailable' }, /not available right now/i],
    ['a server that was never set up', 503, { error: 'not_configured' }, /not available right now/i],
  ] as const) {
    test(`explains ${name} and offers the email address`, async ({ page }) => {
      await answerWith(page, status, body);
      await open(page);
      await page.getByTestId('assistant-launcher').click();
      await page.getByTestId('assistant-suggestion-0').click();
      const alert = page.getByTestId('assistant-error');
      await expect(alert).toContainText(text);
      await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:ahmed\.jenhani2@gmail\.com/);
    });
  }

  test('explains a lost connection', async ({ page }) => {
    await page.route('**/api/ask', (route) => route.abort('failed'));
    await open(page);
    await page.getByTestId('assistant-launcher').click();
    await page.getByTestId('assistant-suggestion-0').click();
    await expect(page.getByTestId('assistant-error')).toContainText(/not available right now/i);
  });

  test('shows an answer as text, never as markup', async ({ page }) => {
    await answerWith(page, 200, { answer: '<img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script>' });
    await open(page);
    await page.getByTestId('assistant-launcher').click();
    await page.getByTestId('assistant-suggestion-0').click();
    await expect(page.getByTestId('assistant-message-assistant')).toContainText('<img src=x');
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
  });

  for (const [lang, theme] of [
    ['en', 'dark'],
    ['fr', 'light'],
  ] as const) {
    test(`has no accessibility violations with the panel open (${lang}, ${theme})`, async ({ page }) => {
      await answerWith(page, 200, { answer: 'Ahmed built RetroLive and Job Tracker.\n\n- RetroLive\n- Job Tracker' });
      await open(page, lang, theme);
      await page.getByTestId('assistant-launcher').click();
      await page.waitForTimeout(400);
      let results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);

      await page.getByTestId('assistant-suggestion-1').click();
      await expect(page.getByTestId('assistant-message-assistant')).toBeVisible();
      results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }

  for (const width of [390, 320]) {
    test(`fits a ${width}px screen, closed and open`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await answerWith(page, 200, { answer: 'A fairly long answer that has to wrap onto several lines on a very small screen without causing sideways scrolling.' });
      await open(page, 'fr');
      const launcher = page.getByTestId('assistant-launcher');
      await expect(launcher).toBeInViewport({ ratio: 1 });

      await launcher.click();
      await page.getByTestId('assistant-suggestion-1').click();
      await expect(page.getByTestId('assistant-message-assistant')).toBeVisible();

      const panel = await page.getByTestId('assistant-panel').boundingBox();
      expect(panel).not.toBeNull();
      expect(panel!.x).toBeGreaterThanOrEqual(0);
      expect(panel!.x + panel!.width).toBeLessThanOrEqual(width);
      expect(panel!.y).toBeGreaterThanOrEqual(0);
      expect(panel!.y + panel!.height).toBeLessThanOrEqual(700);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await expect(page.getByTestId('assistant-input')).toBeInViewport({ ratio: 1 });
    });
  }

  test('the real model answers a question about the internship', async ({ page }) => {
    test.skip(!process.env['LIVE_AI'], 'set LIVE_AI=1 and point BASE_URL at a server that has the Gemini key');
    test.setTimeout(90_000);
    await open(page);
    await page.getByTestId('assistant-launcher').click();
    await page.getByTestId('assistant-suggestion-0').click();
    const answer = page.getByTestId('assistant-message-assistant');
    await expect(answer).toBeVisible({ timeout: 60_000 });
    const text = await answer.innerText();
    expect(text).toMatch(/4 to 6 months|4-6 months|four to six/i);
    expect(text).toMatch(/15 January 2027/i);
    await expect(page.getByTestId('assistant-error')).toHaveCount(0);
  });
});

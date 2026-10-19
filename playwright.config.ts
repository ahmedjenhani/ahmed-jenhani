import { defineConfig } from '@playwright/test';

/**
 * End-to-end tests run against the production build served locally (npm run build, then the preview server),
 * in your installed Chrome so no browser download is needed (BROWSER=chromium to use Playwright's own).
 */
const channel = process.env['BROWSER'] === 'chromium' ? undefined : (process.env['BROWSER'] ?? 'chrome');

export default defineConfig({
  testDir: './tests-e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:4180',
    channel,
    viewport: { width: 1360, height: 860 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env['BASE_URL']
    ? undefined
    : { command: 'npm run build && npm run preview', url: 'http://localhost:4180', reuseExistingServer: true, timeout: 180_000 },
  outputDir: './test-results',
});

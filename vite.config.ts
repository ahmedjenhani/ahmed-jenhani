import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';

/**
 * Social previews (Open Graph, Twitter) need absolute URLs. On Vercel the production address is provided
 * during the build, so it is filled in automatically; locally it falls back to the dev server.
 */
function siteUrl(): Plugin {
  const vercel = process.env['VERCEL_PROJECT_PRODUCTION_URL'];
  const url = (process.env['SITE_URL'] ?? (vercel ? `https://${vercel}` : 'http://localhost:5180')).replace(/\/+$/, '');
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url),
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
  server: { port: 5180, strictPort: true },
  preview: { port: 4180, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

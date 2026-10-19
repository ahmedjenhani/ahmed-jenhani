import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
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

/**
 * Serves POST /api/ask while developing, from the same handler Vercel runs in production. The Gemini key is
 * read from .env.local (never committed).
 */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), ['GEMINI_', 'SITE_URL']);
      for (const [key, value] of Object.entries(env)) {
        process.env[key] ??= value;
      }
      server.middlewares.use('/api/ask', (req, res, next) => {
        server
          .ssrLoadModule('/server/handler.ts')
          .then((mod) => (mod['default'] as (req: unknown, res: unknown) => Promise<void>)(req, res))
          .catch(next);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl(), devApi()],
  server: { port: 5180, strictPort: true },
  preview: { port: 4180, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
  },
});

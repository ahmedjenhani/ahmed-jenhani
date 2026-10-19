// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { createServer, request, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { bundleApi } from '../scripts/build-api.mjs';
import handler from './handler';

let server: Server;
let port: number;

beforeAll(async () => {
  server = createServer((req, res) => void handler(req, res));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = (server.address() as AddressInfo).port;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

beforeEach(() => {
  vi.stubEnv('GEMINI_API_KEY', 'test-key');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'Hello from the model' }] } }] }) }),
  );
});

function call(options: { method?: string; body?: string; origin?: string | null; ip?: string }) {
  return new Promise<{ status: number; headers: Record<string, string | string[] | undefined>; json: unknown }>((resolve, reject) => {
    const headers: Record<string, string> = { 'content-type': 'application/json', 'x-real-ip': options.ip ?? '10.0.0.1' };
    if (options.origin !== null) headers['origin'] = options.origin ?? `http://127.0.0.1:${port}`;
    const req = request({ host: '127.0.0.1', port, path: '/api/ask', method: options.method ?? 'POST', headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, json: JSON.parse(Buffer.concat(chunks).toString() || 'null') }));
    });
    req.on('error', reject);
    req.end(options.body);
  });
}

const question = JSON.stringify({ lang: 'en', messages: [{ role: 'user', text: 'What does Ahmed do?' }] });

describe('POST /api/ask handler', () => {
  it('answers, and tells caches to keep nothing', async () => {
    const res = await call({ body: question, ip: '10.0.0.2' });
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ answer: 'Hello from the model' });
    expect(res.headers['cache-control']).toBe('no-store');
    expect(String(res.headers['content-type'])).toContain('application/json');
  });

  it('only accepts POST', async () => {
    const res = await call({ method: 'GET', ip: '10.0.0.3' });
    expect(res.status).toBe(405);
    expect(res.headers['allow']).toBe('POST');
  });

  it('refuses another website and requests with no origin', async () => {
    expect((await call({ body: question, origin: 'https://evil.example', ip: '10.0.0.4' })).status).toBe(403);
    expect((await call({ body: question, origin: null, ip: '10.0.0.4' })).status).toBe(403);
  });

  it('answers 400 to broken JSON and to an oversized body', async () => {
    expect((await call({ body: '{not json', ip: '10.0.0.5' })).status).toBe(400);
    const huge = JSON.stringify({ messages: [{ role: 'user', text: 'a'.repeat(30_000) }] });
    expect((await call({ body: huge, ip: '10.0.0.5' })).status).toBe(400);
  });

  it('reports a missing key without a stack trace or any detail', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const res = await call({ body: question, ip: '10.0.0.6' });
    expect(res.status).toBe(503);
    expect(res.json).toEqual({ error: 'not_configured' });
  });

  it('rate limits a visitor who keeps asking, with a Retry-After header', async () => {
    let last = await call({ body: question, ip: '10.0.0.7' });
    for (let i = 0; i < 20 && last.status === 200; i++) last = await call({ body: question, ip: '10.0.0.7' });
    expect(last.status).toBe(429);
    expect(Number(last.headers['retry-after'])).toBeGreaterThan(0);
  });
});

describe('api/ask.js, the file Vercel runs', () => {
  it('is the current build of server/handler.ts (run `npm run build:api` after changing the server)', async () => {
    const normalise = (s: string) => s.replace(/\r\n/g, '\n');
    const committed = normalise(await readFile(new URL('../api/ask.js', import.meta.url), 'utf8'));
    expect(committed).toBe(normalise(await bundleApi()));
  });

  it('is self-contained JavaScript with a default export and no leaked secret', async () => {
    const text = await readFile(new URL('../api/ask.js', import.meta.url), 'utf8');
    expect(text).toMatch(/export\s*\{[^}]*as default/);
    expect(text).not.toMatch(/^import\s.*from\s+['"]\./m);
    expect(text).not.toMatch(/AQ\.[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}/);
  });
});

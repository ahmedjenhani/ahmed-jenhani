import type { IncomingMessage, ServerResponse } from 'node:http';
import { LIMITS } from '../src/shared/assistant';
import { handleAsk, RateLimiter } from './assistant';

/**
 * The function behind POST /api/ask. Plain Node request and response objects, so it runs the same on Vercel
 * and inside the Vite dev server. On Vercel it is shipped as api/ask.js, bundled by scripts/build-api.mjs.
 */

const visitorLimiter = new RateLimiter(LIMITS.perVisitor, LIMITS.windowMs);
const dailyLimiter = new RateLimiter(LIMITS.perDay, 24 * 60 * 60_000);

const MAX_BODY_BYTES = 20_000;

async function readJson(req: IncomingMessage & { body?: unknown }): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body !== 'string') return req.body;
    try {
      return JSON.parse(req.body);
    } catch {
      return undefined;
    }
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) return undefined;
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return undefined;
  }
}

const header = (req: IncomingMessage, name: string): string | undefined => {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
};

function clientIp(req: IncomingMessage): string {
  const forwarded = header(req, 'x-forwarded-for')?.split(',')[0]?.trim();
  return header(req, 'x-real-ip') ?? forwarded ?? req.socket.remoteAddress ?? 'unknown';
}

function send(res: ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [key, value] of Object.entries(extra)) res.setHeader(key, value);
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    send(res, 405, { error: 'bad_request' }, { Allow: 'POST' });
    return;
  }

  const env = process.env;
  const production = env['VERCEL_PROJECT_PRODUCTION_URL'];
  const origin = header(req, 'origin');
  const host = header(req, 'host');

  const result = await handleAsk(
    { body: await readJson(req), ip: clientIp(req), ...(origin ? { origin } : {}), ...(host ? { host } : {}) },
    {
      apiKey: env['GEMINI_API_KEY'],
      // measured: 3.1 answers in about 2 s every time; 3.5 often stalls for ~28 s or answers 503, so it is the fallback
      models: [env['GEMINI_MODEL'] || 'gemini-3.1-flash-lite', env['GEMINI_FALLBACK_MODEL'] || 'gemini-3.5-flash-lite'],
      fetchImpl: fetch,
      timeoutMs: 9_000,
      visitorLimiter,
      dailyLimiter,
      ...(production ? { siteUrl: `https://${production}` } : {}),
    },
  );

  send(res, result.status, result.body, result.retryAfterSeconds ? { 'Retry-After': String(result.retryAfterSeconds) } : {});
}

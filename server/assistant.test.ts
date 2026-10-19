// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONTENT } from '../src/content';
import { LIMITS } from '../src/shared/assistant';
import { CERTIFICATIONS, PROJECT_FACTS, SITE } from '../src/site';
import {
  buildKnowledge,
  buildSystemPrompt,
  handleAsk,
  isSameOrigin,
  parseRequest,
  RateLimiter,
  tidyAnswer,
  type AskDeps,
  type AskInput,
} from './assistant';

const question = { role: 'user', text: 'Which projects has Ahmed deployed?' } as const;
const goodBody = { lang: 'en', messages: [question] };
const sameSite = { origin: 'https://ahmed-jenhani.vercel.app', host: 'ahmed-jenhani.vercel.app' };

const gemini = (text: string) => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) });
const failing = (status: number) => ({ ok: false, status, json: async () => ({}) });

function deps(fetchImpl: unknown, over: Partial<AskDeps> = {}): AskDeps {
  return {
    apiKey: 'test-key',
    models: ['primary-model', 'fallback-model'],
    fetchImpl: fetchImpl as typeof fetch,
    timeoutMs: 1000,
    retryDelayMs: 0,
    hedgeDelayMs: 30,
    visitorLimiter: new RateLimiter(100, 60_000),
    dailyLimiter: new RateLimiter(100, 60_000),
    ...over,
  };
}

const input = (over: Partial<AskInput> = {}): AskInput => ({ body: goodBody, ip: '1.2.3.4', ...sameSite, ...over });

describe('buildKnowledge', () => {
  const knowledge = buildKnowledge(CONTENT.en, 'https://ahmed-jenhani.vercel.app');

  it('contains the facts a recruiter asks about', () => {
    for (const fact of [SITE.name, SITE.email, SITE.phone, SITE.linkedin, SITE.github, '4 to 6 months', '15 January 2027', 'Nabeul or Tunis']) {
      expect(knowledge).toContain(fact);
    }
  });

  it('lists every project with its technologies and links, and every certification', () => {
    for (const project of CONTENT.en.projects.items) expect(knowledge).toContain(project.title);
    for (const facts of PROJECT_FACTS) {
      for (const tech of facts.tech) expect(knowledge).toContain(tech);
      if (facts.live) expect(knowledge).toContain(facts.live);
      if (facts.code) expect(knowledge).toContain(facts.code);
    }
    for (const certification of CERTIFICATIONS) expect(knowledge).toContain(certification);
  });

  it('lists every internship', () => {
    for (const e of CONTENT.en.experience.items) {
      expect(knowledge).toContain(e.company);
      expect(knowledge).toContain(e.period);
    }
  });

  it('adds the portfolio and CV addresses only when it knows the site address', () => {
    expect(knowledge).toContain('CV (PDF): https://ahmed-jenhani.vercel.app/Ahmed-Jenhani-CV.pdf');
    expect(buildKnowledge(CONTENT.en)).not.toContain('Portfolio:');
  });

  it('follows the content, so the assistant and the page cannot disagree', () => {
    const changed = structuredClone(CONTENT.en);
    changed.hero.pfe.availability = '1 March 2028';
    expect(buildKnowledge(changed)).toContain('1 March 2028');
  });

  it('never says the source code is available on request', () => {
    expect(knowledge).not.toMatch(/on request/i);
  });
});

describe('buildSystemPrompt', () => {
  it('carries the facts and the rules that keep answers honest', () => {
    const prompt = buildSystemPrompt('FACT-LINE', 'en');
    expect(prompt).toContain('FACT-LINE');
    expect(prompt).toMatch(/ONLY the FACTS/);
    expect(prompt).toMatch(/Never invent/);
    expect(prompt).toMatch(/not Ahmed/);
  });

  it('defaults to the language of the page', () => {
    expect(buildSystemPrompt('x', 'fr')).toMatch(/use French/);
    expect(buildSystemPrompt('x', 'en')).toMatch(/use English/);
  });
});

describe('parseRequest', () => {
  it('accepts a conversation that ends with a question', () => {
    const parsed = parseRequest({ lang: 'fr', messages: [question, { role: 'assistant', text: 'Two.' }, { role: 'user', text: 'And?' }] });
    expect(parsed).toMatchObject({ ok: true, lang: 'fr' });
  });

  it('defaults to English and trims text', () => {
    expect(parseRequest({ messages: [{ role: 'user', text: '  hi  ' }] })).toEqual({ ok: true, lang: 'en', messages: [{ role: 'user', text: 'hi' }] });
  });

  it('drops a leading assistant greeting', () => {
    const parsed = parseRequest({ messages: [{ role: 'assistant', text: 'Hello' }, question] });
    expect(parsed.ok && parsed.messages).toEqual([question]);
  });

  it.each([
    ['not an object', 'hello'],
    ['null', null],
    ['no messages', { messages: [] }],
    ['messages not an array', { messages: 'hi' }],
    ['unknown role', { messages: [{ role: 'system', text: 'hi' }] }],
    ['non-string text', { messages: [{ role: 'user', text: 5 }] }],
    ['empty text', { messages: [{ role: 'user', text: '   ' }] }],
    ['question too long', { messages: [{ role: 'user', text: 'a'.repeat(LIMITS.maxQuestionChars + 1) }] }],
    ['ends with an answer', { messages: [question, { role: 'assistant', text: 'ok' }] }],
    ['too many messages', { messages: Array.from({ length: LIMITS.maxMessages + 1 }, () => question) }],
  ])('rejects %s', (_name, body) => {
    expect(parseRequest(body).ok).toBe(false);
  });

  it('rejects a conversation that is too long overall', () => {
    const answer = { role: 'assistant', text: 'a'.repeat(LIMITS.maxAnswerChars) };
    const long = { role: 'user', text: 'q'.repeat(LIMITS.maxQuestionChars) };
    const messages = [long, answer, long, answer, long, answer, long, answer, long, answer, long];
    expect(messages.length).toBeLessThanOrEqual(LIMITS.maxMessages);
    expect(parseRequest({ messages }).ok).toBe(false);
  });
});

describe('isSameOrigin', () => {
  it('accepts the page itself, on a real address or on localhost', () => {
    expect(isSameOrigin('https://ahmed-jenhani.vercel.app', 'ahmed-jenhani.vercel.app')).toBe(true);
    expect(isSameOrigin('http://localhost:5180', 'localhost:5180')).toBe(true);
  });

  it('refuses other sites, missing headers and garbage', () => {
    expect(isSameOrigin('https://evil.example', 'ahmed-jenhani.vercel.app')).toBe(false);
    expect(isSameOrigin(undefined, 'ahmed-jenhani.vercel.app')).toBe(false);
    expect(isSameOrigin('https://ahmed-jenhani.vercel.app', undefined)).toBe(false);
    expect(isSameOrigin('not a url', 'x')).toBe(false);
  });
});

describe('RateLimiter', () => {
  it('lets a key through up to the limit, then says when to retry', () => {
    let now = 0;
    const limiter = new RateLimiter(2, 10_000, () => now);
    expect(limiter.check('a').allowed).toBe(true);
    now = 1000;
    expect(limiter.check('a').allowed).toBe(true);
    now = 2000;
    expect(limiter.check('a')).toEqual({ allowed: false, retryAfterSeconds: 8 });
  });

  it('keeps visitors apart and frees a slot when the window passes', () => {
    let now = 0;
    const limiter = new RateLimiter(1, 10_000, () => now);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('b').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
    now = 10_001;
    expect(limiter.check('a').allowed).toBe(true);
  });
});

describe('tidyAnswer', () => {
  it('removes the markdown the model adds anyway', () => {
    expect(tidyAnswer('**Hello** there\n\n\n* one\n* two\n## Title')).toBe('Hello there\n\n- one\n- two\nTitle');
  });

  it('caps the length', () => {
    expect(tidyAnswer('a'.repeat(5000))).toHaveLength(LIMITS.maxAnswerChars);
  });
});

describe('handleAsk', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('answers from the model, sending it the facts, the conversation and the key', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(gemini('**Two** apps.'));
    const result = await handleAsk(input({ body: { lang: 'en', messages: [question, { role: 'assistant', text: 'Hi' }, question] } }), deps(fetchImpl));

    expect(result).toEqual({ status: 200, body: { answer: 'Two apps.' } });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit & { headers: Record<string, string>; body: string }];
    expect(url).toContain('/models/primary-model:generateContent');
    expect(init.headers['x-goog-api-key']).toBe('test-key');
    const sent = JSON.parse(init.body);
    expect(sent.systemInstruction.parts[0].text).toContain(SITE.email);
    expect(sent.contents.map((c: { role: string }) => c.role)).toEqual(['user', 'model', 'user']);
  });

  it('refuses requests that do not come from the page itself, before doing anything else', async () => {
    const fetchImpl = vi.fn();
    expect((await handleAsk(input({ origin: 'https://evil.example' }), deps(fetchImpl))).status).toBe(403);
    expect((await handleAsk({ body: goodBody, ip: '1.2.3.4' }, deps(fetchImpl))).status).toBe(403);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('refuses malformed requests without calling the model', async () => {
    const fetchImpl = vi.fn();
    expect(await handleAsk(input({ body: { messages: [] } }), deps(fetchImpl))).toEqual({ status: 400, body: { error: 'bad_request' } });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('reports a missing key as not configured', async () => {
    const result = await handleAsk(input(), deps(vi.fn(), { apiKey: undefined }));
    expect(result).toEqual({ status: 503, body: { error: 'not_configured' } });
  });

  it('limits each visitor, and tells them when to come back', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(gemini('ok'));
    const d = deps(fetchImpl, { visitorLimiter: new RateLimiter(1, 60_000) });
    expect((await handleAsk(input(), d)).status).toBe(200);
    const second = await handleAsk(input(), d);
    expect(second).toMatchObject({ status: 429, body: { error: 'rate_limited' } });
    expect(second.retryAfterSeconds).toBeGreaterThan(0);
    // another visitor is not affected
    expect((await handleAsk(input({ ip: '9.9.9.9' }), d)).status).toBe(200);
  });

  it('stops everyone once the daily budget is spent, to protect the free quota', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(gemini('ok'));
    const d = deps(fetchImpl, { dailyLimiter: new RateLimiter(1, 60_000) });
    expect((await handleAsk(input(), d)).status).toBe(200);
    expect(await handleAsk(input({ ip: '9.9.9.9' }), d)).toMatchObject({ status: 429, body: { error: 'busy' } });
  });

  it('falls back to the second model when the first is rate limited', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(failing(429)).mockResolvedValueOnce(gemini('From the fallback'));
    const result = await handleAsk(input(), deps(fetchImpl));
    expect(result.body).toEqual({ answer: 'From the fallback' });
    expect(fetchImpl.mock.calls[1]?.[0]).toContain('fallback-model');
  });

  it('does not bother the fallback model when the first one answers in time', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(gemini('Quick answer'));
    expect((await handleAsk(input(), deps(fetchImpl))).body).toEqual({ answer: 'Quick answer' });
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('asks the fallback too when the first model is slow, uses whichever answers first, and cancels the other', async () => {
    const fetchImpl = vi
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(gemini('Slow answer')), 400)))
      .mockResolvedValueOnce(gemini('Fast answer'));
    const result = await handleAsk(input(), deps(fetchImpl));

    expect(result.body).toEqual({ answer: 'Fast answer' });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(String(fetchImpl.mock.calls[1]?.[0])).toContain('fallback-model');
    expect((fetchImpl.mock.calls[0]?.[1] as RequestInit).signal?.aborted).toBe(true);
  });

  it('still takes the slow first model when the fallback fails', async () => {
    const fetchImpl = vi
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(gemini('Slow but good')), 120)))
      .mockResolvedValueOnce(failing(500));
    expect((await handleAsk(input(), deps(fetchImpl))).body).toEqual({ answer: 'Slow but good' });
  });

  it('retries an overloaded model (503) once before switching to the fallback', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(failing(503)).mockResolvedValueOnce(gemini('Second try worked'));
    const result = await handleAsk(input(), deps(fetchImpl));
    expect(result.body).toEqual({ answer: 'Second try worked' });
    expect(fetchImpl.mock.calls.map((c) => String(c[0]).includes('primary-model'))).toEqual([true, true]);
  });

  it('does not retry a rate-limited model (429): it moves straight to the fallback', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(failing(429)).mockResolvedValueOnce(gemini('ok'));
    await handleAsk(input(), deps(fetchImpl));
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['both models are out of quota', failing(429), 'busy'],
    ['both models fail', failing(500), 'unavailable'],
    ['both models stay overloaded', failing(503), 'unavailable'],
    ['the model answers with nothing', gemini('  '), 'unavailable'],
  ])('reports %s', async (_name, response, error) => {
    const fetchImpl = vi.fn().mockResolvedValue(response);
    expect(await handleAsk(input(), deps(fetchImpl))).toEqual({ status: 503, body: { error } });
  });

  it('reports an unreachable model as unavailable, and never logs the visitor question', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'));
    const result = await handleAsk(input(), deps(fetchImpl));
    expect(result).toEqual({ status: 503, body: { error: 'unavailable' } });
    const logged = vi.mocked(console.warn).mock.calls.flat().join(' ');
    expect(logged).not.toContain(question.text);
  });
});

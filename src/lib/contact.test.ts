import { describe, expect, it, vi } from 'vitest';
import { buildMailto, sendMessage, validate, type SendDeps } from './contact';

const messages = { name: 'name?', email: 'email?', message: 'message?' };
const good = { name: 'Sara Ben Ali', email: 'sara@example.com', message: 'Hello Ahmed, we have an internship.' };

describe('validate', () => {
  it('accepts a complete message', () => {
    expect(validate(good, messages)).toEqual({});
  });

  it('flags every empty field', () => {
    expect(validate({ name: '', email: '', message: '' }, messages)).toEqual(messages);
  });

  it('ignores surrounding whitespace', () => {
    expect(validate({ name: '  ', email: ' a@b.co ', message: '     ' }, messages)).toEqual({ name: 'name?', message: 'message?' });
  });

  it.each(['plain', 'a@b', 'a@b.c', '@b.com', 'a b@c.com'])('rejects the email "%s"', (email) => {
    expect(validate({ ...good, email }, messages).email).toBe('email?');
  });
});

describe('buildMailto', () => {
  it('encodes subject and body so any text survives', () => {
    const url = buildMailto('me@example.com', 'Hi & hello', { ...good, message: 'Line one\nLine two & more' });
    expect(url.startsWith('mailto:me@example.com?subject=Hi%20%26%20hello&body=')).toBe(true);
    const body = decodeURIComponent(url.split('&body=')[1]);
    expect(body).toBe('Line one\nLine two & more\n\nSara Ben Ali\nsara@example.com');
  });
});

describe('sendMessage', () => {
  const deps = (over: Partial<SendDeps> = {}): SendDeps => ({
    formspreeId: '',
    fetchImpl: vi.fn() as unknown as typeof fetch,
    openMailApp: vi.fn(),
    ...over,
  });

  it('opens the mail app when no online form is configured', async () => {
    const d = deps();
    await expect(sendMessage(good, 'Subject', d)).resolves.toBe('mail-app');
    expect(d.openMailApp).toHaveBeenCalledOnce();
    expect(vi.mocked(d.openMailApp).mock.calls[0][0]).toMatch(/^mailto:/);
    expect(d.fetchImpl).not.toHaveBeenCalled();
  });

  it('posts to Formspree when an id is configured', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const d = deps({ formspreeId: 'abc123', fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(sendMessage(good, 'Subject', d)).resolves.toBe('online');
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://formspree.io/f/abc123');
    expect(JSON.parse(init.body)).toMatchObject({ name: 'Sara Ben Ali', email: 'sara@example.com', _subject: 'Subject' });
    expect(d.openMailApp).not.toHaveBeenCalled();
  });

  it('throws when Formspree refuses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 422 });
    const d = deps({ formspreeId: 'abc123', fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(sendMessage(good, 'Subject', d)).rejects.toThrow('422');
  });
});

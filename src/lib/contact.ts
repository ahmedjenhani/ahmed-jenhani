import { SITE } from '../site';

export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export type FieldErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(values: ContactValues, messages: Record<keyof ContactValues, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) {
    errors.name = messages.name;
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = messages.email;
  }
  if (values.message.trim().length < 5) {
    errors.message = messages.message;
  }
  return errors;
}

/** An email the visitor's own mail app can send: no server needed. */
export function buildMailto(to: string, subject: string, values: ContactValues): string {
  const body = `${values.message.trim()}\n\n${values.name.trim()}\n${values.email.trim()}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type SendOutcome = 'mail-app' | 'online';

export interface SendDeps {
  formspreeId: string;
  fetchImpl: typeof fetch;
  openMailApp: (url: string) => void;
}

const defaultDeps = (): SendDeps => ({
  formspreeId: SITE.formspreeId,
  fetchImpl: (...args) => fetch(...args),
  openMailApp: (url) => {
    window.location.href = url;
  },
});

/**
 * With a Formspree form id configured, the message is sent online. Without one (the default), it opens the
 * visitor's email app with everything filled in, so the contact form works with no server and no third party.
 */
export async function sendMessage(values: ContactValues, subject: string, deps: SendDeps = defaultDeps()): Promise<SendOutcome> {
  if (deps.formspreeId) {
    const response = await deps.fetchImpl(`https://formspree.io/f/${encodeURIComponent(deps.formspreeId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), message: values.message.trim(), _subject: subject }),
    });
    if (!response.ok) {
      throw new Error(`Formspree answered ${response.status}`);
    }
    return 'online';
  }
  deps.openMailApp(buildMailto(SITE.email, subject, values));
  return 'mail-app';
}

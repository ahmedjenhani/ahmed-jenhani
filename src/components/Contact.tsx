import { useState, type FormEvent } from 'react';
import { sendMessage, validate, type ContactValues, type FieldErrors } from '../lib/contact';
import { useI18n } from '../lib/i18n';
import { SITE } from '../site';
import { CheckIcon, CopyIcon, GithubIcon, LinkedinIcon, MailIcon, PhoneIcon, PinIcon } from './icons';
import { Card, Reveal, Section, cn } from './ui';

type Status = 'idle' | 'sending' | 'mail-app' | 'online' | 'failed';

const FIELD =
  'w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';

function ContactForm() {
  const { t } = useI18n();
  const f = t.contact.form;
  const [values, setValues] = useState<ContactValues>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  // a hidden field that real visitors never fill in; bots usually do
  const [trap, setTrap] = useState('');

  const set = (key: keyof ContactValues) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validate(values, f.validation);
    setErrors(found);
    if (Object.keys(found).length > 0 || trap) {
      return;
    }
    setStatus('sending');
    try {
      setStatus(await sendMessage(values, f.subject));
      if (SITE.formspreeId) {
        setValues({ name: '', email: '', message: '' });
      }
    } catch {
      setStatus('failed');
    }
  }

  const field = (key: keyof ContactValues, label: string, input: 'input' | 'email' | 'textarea') => {
    const id = `contact-${key}`;
    const error = errors[key];
    const common = {
      id,
      name: key,
      value: values[key],
      onChange: set(key),
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${id}-error` : undefined,
      className: cn(FIELD, error && 'border-rose-500'),
      'data-testid': id,
    };
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
        {input === 'textarea' ? (
          <textarea {...common} rows={5} className={cn(common.className, 'resize-y')} />
        ) : (
          <input {...common} type={input === 'email' ? 'email' : 'text'} autoComplete={input === 'email' ? 'email' : 'name'} />
        )}
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 md:p-8">
      <h3 className="mb-6 text-xl font-semibold">{f.title}</h3>
      <form onSubmit={submit} noValidate className="space-y-5" data-testid="contact-form">
        {field('name', f.name, 'input')}
        {field('email', f.email, 'email')}
        {field('message', f.message, 'textarea')}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </label>
        </div>
        <button
          type="submit"
          disabled={status === 'sending'}
          data-testid="contact-send"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:brightness-110 disabled:opacity-60"
        >
          <MailIcon /> {status === 'sending' ? f.sending : f.send}
        </button>
        <div aria-live="polite" data-testid="contact-status">
          {(status === 'mail-app' || status === 'online') && (
            <p className="flex gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
              <CheckIcon className="mt-0.5 shrink-0" width={18} height={18} />
              {status === 'online' ? f.sentOnline : f.sentMail}
            </p>
          )}
          {status === 'failed' && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-800 dark:text-rose-300">{f.failed}</p>}
        </div>
      </form>
    </Card>
  );
}

function CopyEmail() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the address is right there to select and copy by hand
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-testid="copy-email"
      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-accent hover:text-accent"
    >
      {copied ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
      <span aria-live="polite">{copied ? t.contact.info.copied : t.contact.info.copy}</span>
    </button>
  );
}

export function Contact() {
  const { t } = useI18n();
  const c = t.contact;
  const row = 'flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-accent/60';
  const icon = 'grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent';

  return (
    <Section id="contact" number={5} eyebrow={t.nav.contact} title={c.title} subtitle={c.intro}>
      <div className="grid gap-8 lg:grid-cols-2">
        <Reveal className="space-y-4">
          <div className={row}>
            <span className={icon}>
              <MailIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">{c.info.email}</p>
              <a href={`mailto:${SITE.email}`} className="break-all font-semibold hover:text-accent" data-testid="email-link">
                {SITE.email}
              </a>
            </div>
            <CopyEmail />
          </div>
          <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className={row} data-testid="phone-link">
            <span className={icon}>
              <PhoneIcon />
            </span>
            <div>
              <p className="text-xs text-muted">{c.info.phone}</p>
              <p className="font-semibold">{SITE.phone}</p>
            </div>
          </a>
          <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className={row}>
            <span className={icon}>
              <LinkedinIcon />
            </span>
            <div>
              <p className="text-xs text-muted">{c.info.linkedin}</p>
              <p className="font-semibold">ahmed-jenhani</p>
            </div>
          </a>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer" className={row}>
            <span className={icon}>
              <GithubIcon />
            </span>
            <div>
              <p className="text-xs text-muted">{c.info.github}</p>
              <p className="font-semibold">ahmedjenhani</p>
            </div>
          </a>
          <div className={row}>
            <span className={icon}>
              <PinIcon />
            </span>
            <div>
              <p className="text-xs text-muted">{c.info.location}</p>
              <p className="font-semibold">{c.info.locationValue}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}

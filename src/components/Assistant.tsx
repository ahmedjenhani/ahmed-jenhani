import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { askAssistant, AssistantError, errorKind } from '../lib/assistant';
import { useI18n } from '../lib/i18n';
import { LIMITS, type ChatMessage } from '../shared/assistant';
import { SITE } from '../site';
import { CloseIcon, MailIcon, SendIcon, SparkleIcon } from './icons';
import { cn } from './ui';

type Failure = 'rateLimited' | 'busy' | 'unavailable';

/**
 * A chat bubble in the corner that answers recruiters' questions about Ahmed. The answers come from the
 * server (POST /api/ask), which only knows what is on his CV and in this portfolio.
 */
export function Assistant() {
  const { t, lang } = useI18n();
  const a = t.assistant;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // move focus into the panel when it opens and back to the button when it closes
  useEffect(() => {
    if (open) {
      field.current?.focus();
    } else if (wasOpen.current) {
      launcher.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  // keep the newest message in view: a new answer is shown from its first line, anything else from the bottom
  useEffect(() => {
    const el = log.current;
    if (!el) return;
    const answers = el.querySelectorAll<HTMLElement>('[data-role="assistant"]');
    const newest = answers[answers.length - 1];
    if (newest && messages[messages.length - 1]?.role === 'assistant' && !loading && !failure) {
      el.scrollTop = Math.max(0, newest.offsetTop - 12);
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading, failure]);

  async function ask(question: string) {
    const text = question.trim().slice(0, LIMITS.maxQuestionChars);
    if (!text || loading) return;

    const next: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setFailure(null);
    setLoading(true);
    try {
      const answer = await askAssistant(next, lang);
      setMessages([...next, { role: 'assistant', text: answer }]);
    } catch (error) {
      setFailure(errorKind(error instanceof AssistantError ? error.code : 'network'));
    } finally {
      setLoading(false);
      field.current?.focus();
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') setOpen(false);
  }

  function reset() {
    setMessages([]);
    setFailure(null);
    setInput('');
    field.current?.focus();
  }

  return (
    <>
      {!open && (
        <button
          ref={launcher}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls="assistant-panel"
          data-testid="assistant-launcher"
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-600/30 transition hover:brightness-110 active:scale-[0.98] sm:bottom-6 sm:right-6"
        >
          <SparkleIcon />
          {a.launcher}
        </button>
      )}

      {open && (
        <section
          id="assistant-panel"
          role="dialog"
          aria-label={a.title}
          data-testid="assistant-panel"
          onKeyDown={onKeyDown}
          className="fixed inset-x-3 bottom-3 z-50 flex max-h-[min(40rem,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[26rem]"
        >
          <header className="flex items-start gap-3 border-b border-line px-4 py-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
              <SparkleIcon width={18} height={18} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold leading-tight">{a.title}</h2>
              <p className="mt-0.5 text-xs text-muted">{a.subtitle}</p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                data-testid="assistant-clear"
                className="rounded-lg border border-line px-2 py-1 text-xs font-medium text-muted transition hover:border-accent hover:text-accent"
              >
                {a.clear}
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={a.close}
              data-testid="assistant-close"
              className="rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <CloseIcon width={18} height={18} />
            </button>
          </header>

          <div ref={log} role="log" aria-live="polite" className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4" data-testid="assistant-log">
            <p className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md border border-line bg-surface-2 px-3.5 py-2.5 text-sm">
              {a.greeting}
            </p>

            {messages.map((m, i) => (
              <p
                key={i}
                data-testid={`assistant-message-${m.role}`}
                data-role={m.role}
                className={cn(
                  'max-w-[90%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-sm',
                  m.role === 'user'
                    ? 'ml-auto rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                    : 'rounded-2xl rounded-bl-md border border-line bg-surface-2',
                )}
              >
                {m.text}
              </p>
            ))}

            {loading && (
              <p className="inline-flex items-center gap-2 text-sm text-muted" data-testid="assistant-thinking">
                <span className="ping-soft inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                {a.thinking}
              </p>
            )}

            {failure && (
              <div role="alert" data-testid="assistant-error" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-800 dark:text-rose-300">
                <p>{a.errors[failure]}</p>
                <a href={`mailto:${SITE.email}`} className="mt-2 inline-flex items-center gap-1.5 font-semibold underline">
                  <MailIcon width={16} height={16} /> {a.emailCta}
                </a>
              </div>
            )}

            {messages.length === 0 && (
              <ul className="flex flex-wrap gap-2 pt-1" aria-label={a.title}>
                {a.suggestions.map((question, i) => (
                  <li key={question}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void ask(question)}
                      data-testid={`assistant-suggestion-${i}`}
                      className="rounded-full border border-accent/40 bg-accent/5 px-3 py-1.5 text-left text-xs font-medium text-accent transition hover:bg-accent/10 disabled:opacity-60"
                    >
                      {question}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-line px-3 pb-2 pt-3">
            <div className="flex gap-2">
              <label htmlFor="assistant-input" className="sr-only">
                {a.inputLabel}
              </label>
              <input
                ref={field}
                id="assistant-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={LIMITS.maxQuestionChars}
                placeholder={a.placeholder}
                autoComplete="off"
                data-testid="assistant-input"
                className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button
                type="submit"
                disabled={loading || input.trim().length === 0}
                aria-label={a.send}
                data-testid="assistant-send"
                className="grid w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white transition hover:brightness-110 disabled:opacity-50"
              >
                <SendIcon />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] leading-snug text-muted">{a.note}</p>
          </form>
        </section>
      )}
    </>
  );
}

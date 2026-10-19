import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONTENT } from '../content';
import { I18nProvider } from '../lib/i18n';
import { SITE } from '../site';
import { Assistant } from './Assistant';

const reply = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

function setup(lang: 'en' | 'fr' = 'en') {
  localStorage.setItem('portfolio.lang', lang);
  return render(
    <I18nProvider>
      <Assistant />
    </I18nProvider>,
  );
}

async function openPanel() {
  await userEvent.click(screen.getByTestId('assistant-launcher'));
  return screen.getByTestId('assistant-panel');
}

const sentBody = (fetchMock: ReturnType<typeof vi.fn>, call = 0) => JSON.parse((fetchMock.mock.calls[call]?.[1] as { body: string }).body);

describe('Assistant', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(reply(200, { answer: 'Ahmed built two apps.' }));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts as a button and opens a panel with a greeting, suggestions and a focused input', async () => {
    setup();
    expect(screen.queryByTestId('assistant-panel')).not.toBeInTheDocument();
    const panel = await openPanel();
    expect(within(panel).getByText(CONTENT.en.assistant.greeting)).toBeInTheDocument();
    for (let i = 0; i < CONTENT.en.assistant.suggestions.length; i++) {
      expect(screen.getByTestId(`assistant-suggestion-${i}`)).toHaveTextContent(CONTENT.en.assistant.suggestions[i] as string);
    }
    expect(screen.getByTestId('assistant-input')).toHaveFocus();
    expect(panel).toHaveAttribute('role', 'dialog');
  });

  it('asks the question of a suggestion and shows the answer', async () => {
    setup();
    await openPanel();
    await userEvent.click(screen.getByTestId('assistant-suggestion-1'));

    expect(await screen.findByText('Ahmed built two apps.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/ask');
    expect(sentBody(fetchMock)).toEqual({ lang: 'en', messages: [{ role: 'user', text: CONTENT.en.assistant.suggestions[1] }] });
    // the suggestions go away once the conversation starts
    expect(screen.queryByTestId('assistant-suggestion-0')).not.toBeInTheDocument();
  });

  it('sends a typed question with Enter, and cannot send an empty one', async () => {
    setup();
    await openPanel();
    expect(screen.getByTestId('assistant-send')).toBeDisabled();
    await userEvent.type(screen.getByTestId('assistant-input'), 'Does he know Docker?{Enter}');
    expect(await screen.findByTestId('assistant-message-assistant')).toBeInTheDocument();
    expect(screen.getByTestId('assistant-message-user')).toHaveTextContent('Does he know Docker?');
    expect(screen.getByTestId('assistant-input')).toHaveValue('');
  });

  it('shows that it is thinking, and ignores a second question until the first is answered', async () => {
    let finish: (value: unknown) => void = () => undefined;
    fetchMock.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    setup();
    await openPanel();
    await userEvent.type(screen.getByTestId('assistant-input'), 'First?{Enter}');
    expect(await screen.findByTestId('assistant-thinking')).toBeInTheDocument();
    await userEvent.type(screen.getByTestId('assistant-input'), 'Second?{Enter}');
    expect(fetchMock).toHaveBeenCalledOnce();
    finish(reply(200, { answer: 'Done.' }));
    expect(await screen.findByText('Done.')).toBeInTheDocument();
    expect(screen.queryByTestId('assistant-thinking')).not.toBeInTheDocument();
  });

  it('sends the earlier turns as context, at most the last six', async () => {
    setup();
    await openPanel();
    for (let i = 1; i <= 5; i++) {
      await userEvent.type(screen.getByTestId('assistant-input'), `Question ${i}{Enter}`);
      await waitFor(() => expect(screen.getAllByTestId('assistant-message-assistant')).toHaveLength(i));
    }
    const last = sentBody(fetchMock, 4);
    expect(last.messages).toHaveLength(6);
    expect(last.messages.at(-1)).toEqual({ role: 'user', text: 'Question 5' });
    expect(last.messages[0].role).toBe('assistant');
  });

  it.each([
    ['rate_limited', 429, CONTENT.en.assistant.errors.rateLimited],
    ['busy', 503, CONTENT.en.assistant.errors.busy],
    ['unavailable', 503, CONTENT.en.assistant.errors.unavailable],
    ['not_configured', 503, CONTENT.en.assistant.errors.unavailable],
    ['forbidden', 403, CONTENT.en.assistant.errors.unavailable],
  ])('explains a %s failure and offers the email address', async (error, status, message) => {
    fetchMock.mockResolvedValue(reply(status, { error }));
    setup();
    await openPanel();
    await userEvent.click(screen.getByTestId('assistant-suggestion-0'));
    const alert = await screen.findByTestId('assistant-error');
    expect(alert).toHaveTextContent(message);
    expect(within(alert).getByRole('link')).toHaveAttribute('href', `mailto:${SITE.email}`);
  });

  it('copes with a network failure and with a broken answer', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    setup();
    await openPanel();
    await userEvent.click(screen.getByTestId('assistant-suggestion-0'));
    expect(await screen.findByTestId('assistant-error')).toHaveTextContent(CONTENT.en.assistant.errors.unavailable);

    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => { throw new Error('not json'); } });
    await userEvent.type(screen.getByTestId('assistant-input'), 'Again?{Enter}');
    await waitFor(() => expect(screen.getByTestId('assistant-error')).toBeInTheDocument());
    expect(screen.queryByTestId('assistant-message-assistant')).not.toBeInTheDocument();
  });

  it('shows an answer as plain text, never as HTML', async () => {
    fetchMock.mockResolvedValue(reply(200, { answer: '<img src=x onerror="alert(1)"> <b>bold</b>' }));
    setup();
    await openPanel();
    await userEvent.click(screen.getByTestId('assistant-suggestion-0'));
    const bubble = await screen.findByTestId('assistant-message-assistant');
    expect(bubble).toHaveTextContent('<img src=x onerror="alert(1)"> <b>bold</b>');
    expect(bubble.querySelector('img, b')).toBeNull();
  });

  it('closes with Escape and gives the focus back to the button', async () => {
    setup();
    await openPanel();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByTestId('assistant-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('assistant-launcher')).toHaveFocus();
  });

  it('starts over with a new conversation', async () => {
    setup();
    await openPanel();
    await userEvent.click(screen.getByTestId('assistant-suggestion-0'));
    await screen.findByTestId('assistant-message-assistant');
    await userEvent.click(screen.getByTestId('assistant-clear'));
    expect(screen.queryByTestId('assistant-message-user')).not.toBeInTheDocument();
    expect(screen.getByTestId('assistant-suggestion-0')).toBeInTheDocument();
  });

  it('speaks French and tells the server to answer in French', async () => {
    setup('fr');
    const panel = await openPanel();
    expect(within(panel).getByText(CONTENT.fr.assistant.greeting)).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('assistant-suggestion-0'));
    await screen.findByTestId('assistant-message-assistant');
    expect(sentBody(fetchMock).lang).toBe('fr');
  });
});

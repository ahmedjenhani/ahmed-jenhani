import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as contact from '../lib/contact';
import { I18nProvider } from '../lib/i18n';
import { SITE } from '../site';
import { Contact } from './Contact';

function setup() {
  return render(
    <I18nProvider>
      <Contact />
    </I18nProvider>,
  );
}

describe('Contact', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem('portfolio.lang', 'en');
  });

  it('shows the visitor what is wrong instead of sending an incomplete message', async () => {
    const send = vi.spyOn(contact, 'sendMessage');
    setup();
    await userEvent.click(screen.getByTestId('contact-send'));
    expect(screen.getAllByRole('alert')).toHaveLength(3);
    expect(screen.getByTestId('contact-email')).toHaveAttribute('aria-invalid', 'true');
    expect(send).not.toHaveBeenCalled();
  });

  it('sends a valid message and confirms it', async () => {
    const send = vi.spyOn(contact, 'sendMessage').mockResolvedValue('mail-app');
    setup();
    await userEvent.type(screen.getByTestId('contact-name'), 'Sara Ben Ali');
    await userEvent.type(screen.getByTestId('contact-email'), 'sara@example.com');
    await userEvent.type(screen.getByTestId('contact-message'), 'Hello Ahmed, we have an internship.');
    await userEvent.click(screen.getByTestId('contact-send'));
    expect(send).toHaveBeenCalledOnce();
    expect(await screen.findByText(/mail app/i)).toBeInTheDocument();
  });

  it('does not send when the hidden trap field is filled', async () => {
    const send = vi.spyOn(contact, 'sendMessage');
    const { container } = setup();
    await userEvent.type(screen.getByTestId('contact-name'), 'Bot Bot');
    await userEvent.type(screen.getByTestId('contact-email'), 'bot@example.com');
    await userEvent.type(screen.getByTestId('contact-message'), 'Buy my pills now');
    await userEvent.type(container.querySelector('input[tabindex="-1"]') as HTMLInputElement, 'spam');
    await userEvent.click(screen.getByTestId('contact-send'));
    expect(send).not.toHaveBeenCalled();
  });

  it('tells the visitor when sending fails', async () => {
    vi.spyOn(contact, 'sendMessage').mockRejectedValue(new Error('down'));
    setup();
    await userEvent.type(screen.getByTestId('contact-name'), 'Sara Ben Ali');
    await userEvent.type(screen.getByTestId('contact-email'), 'sara@example.com');
    await userEvent.type(screen.getByTestId('contact-message'), 'Hello Ahmed, we have an internship.');
    await userEvent.click(screen.getByTestId('contact-send'));
    expect(await screen.findByText(/could not be sent/i)).toBeInTheDocument();
  });

  it('links to the email address and external profiles safely', () => {
    setup();
    expect(screen.getByTestId('email-link')).toHaveAttribute('href', `mailto:${SITE.email}`);
    for (const href of [SITE.linkedin, SITE.github]) {
      const link = document.querySelector(`a[href="${href}"]`);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });

  it('copies the email address', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    setup();
    await userEvent.click(screen.getByTestId('copy-email'));
    expect(writeText).toHaveBeenCalledWith(SITE.email);
  });
});

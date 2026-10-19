import type { Lang } from '../content';
import { LIMITS, type AskErrorCode, type AskRequest, type ChatMessage } from '../shared/assistant';

/** Why a question got no answer. `network` means the request never reached the server. */
export class AssistantError extends Error {
  constructor(readonly code: AskErrorCode | 'network') {
    super(code);
  }
}

const ERROR_CODES: readonly string[] = ['bad_request', 'forbidden', 'rate_limited', 'busy', 'unavailable', 'not_configured'];

/** Sends the end of the conversation to the server and returns the assistant's answer. */
export async function askAssistant(
  messages: ChatMessage[],
  lang: Lang,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): Promise<string> {
  const request: AskRequest = { messages: messages.slice(-LIMITS.historySent), lang };

  let response: Response;
  try {
    response = await fetchImpl('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new AssistantError('network');
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new AssistantError('unavailable');
  }

  const { answer, error } = (json ?? {}) as { answer?: unknown; error?: unknown };
  if (response.ok && typeof answer === 'string' && answer.length > 0) {
    return answer;
  }
  throw new AssistantError(typeof error === 'string' && ERROR_CODES.includes(error) ? (error as AskErrorCode) : 'unavailable');
}

/** The wording to show a visitor for a failure: only the cases a visitor can act on get their own message. */
export function errorKind(code: AskErrorCode | 'network'): 'rateLimited' | 'busy' | 'unavailable' {
  if (code === 'rate_limited') return 'rateLimited';
  if (code === 'busy') return 'busy';
  return 'unavailable';
}

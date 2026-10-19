import type { Lang } from '../content';

/** What the browser and the server agree on. Kept free of any browser or server API so both can import it. */

export const LIMITS = {
  /** longest question a visitor can send */
  maxQuestionChars: 500,
  /** longest earlier answer the browser sends back as context */
  maxAnswerChars: 1500,
  /** most messages the server accepts in one request */
  maxMessages: 12,
  /** most messages the browser sends back as context */
  historySent: 6,
  maxTotalChars: 8000,
  /** per visitor, per window */
  perVisitor: 12,
  windowMs: 10 * 60_000,
  /** everyone together, per day: protects the free AI quota */
  perDay: 300,
} as const;

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export interface AskRequest {
  messages: ChatMessage[];
  lang: Lang;
}

export type AskErrorCode = 'bad_request' | 'forbidden' | 'rate_limited' | 'busy' | 'unavailable' | 'not_configured';

export type AskResponse = { answer: string } | { error: AskErrorCode; retryAfterSeconds?: number };

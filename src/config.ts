/** Build-time settings that only the browser bundle reads (kept out of site.ts, which the server also imports). */

// Optional: create a free form at https://formspree.io and set VITE_FORMSPREE_ID to send messages without an email app.
export const FORMSPREE_ID = (import.meta.env['VITE_FORMSPREE_ID'] as string | undefined) ?? '';

# Ahmed Jenhani — Portfolio

Personal portfolio of Ahmed Jenhani, software engineering student and full-stack developer, looking for a 4 to 6 month graduation internship (PFE) from 15 January 2027.

**Live:** https://ahmed-jenhani.vercel.app

## What is in it

A single page with six sections: **Home, About, Skills, Projects, Experience, Contact**.

- **English / French** with a switch in the header. The first visit follows the browser language; the choice is remembered.
- **Light / dark theme**, following the system setting until the visitor chooses. Applied before the first paint, so there is no flash.
- **Internship search made visible** in the first screen: graduation internship (PFE), duration, and availability date.
- **Projects** with the two applications that are live on the web (RetroLive and Job Tracker): screenshot, story, live link and source code, plus other work from studies and internships.
- **AI assistant** in the corner of the page: recruiters ask questions about Ahmed and get answers drawn only from his CV and this portfolio (see below).
- **Contact form that works without a server.** By default it opens the visitor's own mail app with the message filled in. Set a [Formspree](https://formspree.io) form id and it sends online instead.
- **Downloadable CV** (PDF), Open Graph / Twitter preview image, structured data for search engines.
- Accessible and responsive: keyboard navigation, labelled controls, reduced-motion respected, no sideways scrolling down to 320 px wide.

## Stack

Vite 7 · React 19 · TypeScript (strict) · Tailwind CSS 4. The site is static; the only server code is one small Vercel function for the AI assistant (Google Gemini, free tier). No database.

## The AI assistant

A chat panel opens from a button in the corner. A visitor can use a suggested question or type their own, in English or French.

- **Grounded:** the server builds the assistant's knowledge from the same data that renders the page (`src/content.ts`, `src/site.ts`), so the assistant and the page cannot disagree. The prompt tells it to answer only from those facts, to say "not listed" or "I don't have that information" instead of guessing, to refuse unrelated requests, and to stay brief.
- **Safe to expose:** the Gemini key lives only on the server (`GEMINI_API_KEY`). The endpoint only accepts requests from the page itself, validates and size-limits every input, limits each visitor to 12 questions per 10 minutes and everyone together to 300 per day (to protect the free quota), never stores or logs questions, and the browser shows answers as plain text, never as HTML.
- **Reliable on a free tier:** it tries `gemini-3.1-flash-lite` first; if that is slow (more than 3.5 s) or failing, the same question also goes to `gemini-3.5-flash-lite` and the first good answer wins. If both fail, the visitor sees a clear message and the email address.
- **Shipped as plain JavaScript:** `server/handler.ts` is bundled by `npm run build:api` into `api/ask.js`, the file Vercel runs. The bundle is committed and a test fails if it is out of date, so a change to the server is never forgotten (run `npm run build:api` after editing `server/` or the content). `npm run build` also refreshes it.

```
browser → POST /api/ask → api/ask.js (checks, limits, prompt) → Gemini → answer
```

### Setup

1. Create a free key at [Google AI Studio](https://aistudio.google.com/apikey). Use a key from its **own Google project**, so the assistant has its own free quota and cannot use up the quota of other apps.
2. Locally: copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. `npm run dev` then serves `/api/ask` too.
3. On Vercel: **Settings → Environment Variables → `GEMINI_API_KEY`** (Production and Preview), then redeploy.

Without a key the page works as usual; the assistant just tells the visitor it is unavailable and shows the email address.

## Run it

```bash
npm install
npm run dev          # http://localhost:5180
```

| Command | What it does |
| --- | --- |
| `npm run build:api` | Rebuild `api/ask.js` (the AI function) from `server/` |
| `npm run build` | Rebuild the function, type-check, then build to `dist/` |
| `npm run preview` | Serve the build on http://localhost:4180 |
| `npm test` | Unit and component tests (Vitest + Testing Library) |
| `npm run test:e2e` | End-to-end tests in Chrome (Playwright), including an accessibility scan with axe |

## Tests

- **Unit / component (105):** the English and French texts have exactly the same structure and no empty strings; language and theme detection; the internship, location, phone and project-link facts; contact validation, mail link and Formspree sending; the contact form (errors, success, failure, spam trap, copy email). The AI assistant: grounding facts, request validation, rate limits, origin check, model fallback and retries, the HTTP handler, a check that the committed `api/ask.js` is up to date, and the chat panel.
- **End to end (36, one of them opt-in):** page loads with no console error or failed request; the PFE availability, locations and phone number; project links and screenshots; the CV is a real PDF; language and theme switches survive a reload; navigation; contact form; **no accessibility violations in English/French × light/dark**; no horizontal overflow at 390 px and 320 px; mobile menu; link-preview metadata. The assistant: opening, answering in both languages, every error message, safe rendering, accessibility with the panel open, and fit on 390 px and 320 px screens. With `LIVE_AI=1` and a server that has the key, one more test asks the real model.

## Configuration

Everything is optional.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Turns the AI assistant on (server only, never sent to the browser) |
| `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` | Models tried in order (defaults: `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`) |
| `VITE_FORMSPREE_ID` | Send contact messages online through Formspree instead of opening the mail app |
| `SITE_URL` | Public address used in the link-preview tags. On Vercel it is filled in automatically |

## Deploy on Vercel

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project**, import the repository. The framework is detected as **Vite**; the defaults are right (`npm run build`, output `dist`).
3. Deploy. Every push to `main` redeploys.

## Editing the content

- Texts (both languages): `src/content.ts`. The compiler refuses to build if one language has a field the other lacks.
- Facts that do not change with the language (links, contact details, technologies): `src/site.ts`.
- Images and the CV: `public/`.

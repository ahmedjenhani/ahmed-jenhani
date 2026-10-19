# Ahmed Jenhani — Portfolio

Personal portfolio of Ahmed Jenhani, software engineering student and full-stack developer, looking for a 4 to 6 month graduation internship (PFE) from 15 January 2027.

**Live:** https://ahmed-jenhani.vercel.app

## What is in it

A single page with six sections: **Home, About, Skills, Projects, Experience, Contact**.

- **English / French** with a switch in the header. The first visit follows the browser language; the choice is remembered.
- **Light / dark theme**, following the system setting until the visitor chooses. Applied before the first paint, so there is no flash.
- **Internship search made visible** in the first screen: graduation internship (PFE), duration, and availability date.
- **Projects** with the two applications that are live on the web (RetroLive and Job Tracker): screenshot, story, live link and source code, plus other work from studies and internships.
- **Contact form that works without a server.** By default it opens the visitor's own mail app with the message filled in. Set a [Formspree](https://formspree.io) form id and it sends online instead.
- **Downloadable CV** (PDF), Open Graph / Twitter preview image, structured data for search engines.
- Accessible and responsive: keyboard navigation, labelled controls, reduced-motion respected, no sideways scrolling down to 320 px wide.

## Stack

Vite 7 · React 19 · TypeScript (strict) · Tailwind CSS 4. No backend, no database: it is a static site.

## Run it

```bash
npm install
npm run dev          # http://localhost:5180
```

| Command | What it does |
| --- | --- |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the build on http://localhost:4180 |
| `npm test` | Unit and component tests (Vitest + Testing Library) |
| `npm run test:e2e` | End-to-end tests in Chrome (Playwright), including an accessibility scan with axe |

## Tests

- **Unit / component (37):** the English and French texts have exactly the same structure and no empty strings; language and theme detection; the internship, location, phone and project-link facts; contact validation, mail link and Formspree sending; the contact form (errors, success, failure, spam trap, copy email).
- **End to end (21):** page loads with no console error or failed request; the PFE availability, locations and phone number; project links and screenshots; the CV is a real PDF; language and theme switches survive a reload; navigation; contact form; **no accessibility violations in English/French × light/dark**; no horizontal overflow at 390 px and 320 px; mobile menu; link-preview metadata.

## Configuration

Everything is optional.

| Variable | Purpose |
| --- | --- |
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

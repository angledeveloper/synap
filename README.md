This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project overview

This repository powers the Synapsea Global reports website, where customers can browse and purchase reports. The site is multilingual (eight languages) and must deliver strong SEO, especially for report detail pages. Most content is retrieved from a Laravel backend API, so reliable data fetching and rendering are core to the app.

## Project structure

- `src/app/[lang]`: Language-scoped App Router pages (e.g., `/<lang>/reports`, `/<lang>/contact`).
- `src/app/sitemaps`: SEO sitemaps and alternate language link generation.
- `src/components`: Shared UI components (layout, report cards, forms, etc.).
- `src/hooks`: Data-fetching hooks for reports, translations, navbar data, and more.
- `src/lib`: Cross-cutting utilities and translation fallbacks.

## Multilingual setup

- **Supported locales** live in `src/lib/utils.ts` via `supportedLanguages` and `codeToId` (English is the default). These codes map to backend `language_id` values for Laravel API requests.
- **Edge-safe locale list** for middleware lives in `src/lib/i18n.ts`.
- **Routing** is handled by the `[lang]` App Router segment. A `middleware.ts` rewrite/redirect keeps `/` as English while `/fr`, `/es`, etc. use the localized routes.
- **Language state** is managed in `src/store.tsx` (`useLanguageStore`) and read by components to render localized navigation and content.
- **Translations** are fetched per page via `useTranslations` with a fallback dictionary in `src/lib/translations.ts` if the API data is missing.

## Report page caching (ISR)

Report detail pages at `/<lang>/reports/[id]` are cached at the edge using ISR to reduce latency from the India-hosted backend. Caching is configured only for report detail pages and uses a 1-hour revalidate window.

Key behaviors:
- First request per report generates HTML and stores it at the edge.
- Subsequent requests are served from cache (`X-Vercel-Cache: HIT`) globally.
- Query params like `?ref_id=...` do not change server rendering, so cache is not fragmented.

### Cache verification (live)

Use GET requests for cache checks (HEAD often misses cache):

```bash
curl -s -D - -o NUL "https://synapseaglobal.com/reports/global-sustainable-aviation-fuels-market-outlook-28"
curl -s -D - -o NUL "https://synapseaglobal.com/reports/global-sustainable-aviation-fuels-market-outlook-28"
curl -s -D - -o NUL "https://synapseaglobal.com/reports/global-sustainable-aviation-fuels-market-outlook-28?ref_id=28"
```

Expected:
- First request: `X-Vercel-Cache: MISS`
- Repeat requests: `X-Vercel-Cache: HIT`
- Same `ETag` and `Content-Length` across repeats

## Getting Started

### Prerequisites

- Node.js 20.x LTS
- npm (preferred package manager)

### Setup

Install dependencies:

```bash
npm ci
```

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Useful commands

```bash
npm run lint
npm run build
npm run start
```

### Troubleshooting

- If installs fail, make sure you are on Node.js 20.x LTS and retry `npm ci`.
- If the dev server fails to start, confirm port `3000` is available or set `PORT=3000`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

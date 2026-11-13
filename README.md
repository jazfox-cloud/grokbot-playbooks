# Grok Bot Playbooks

Bilingual (EN / 简体中文) static playbook library of concrete Grok Bot use cases. Built with Astro (`output: 'static'`).

**Tagline (ZH):** 可抄作业的 Grok Bot 实战案例库 / Playbook

## Local development

```bash
npm install
npm run dev
```

Other scripts:

- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build
- `npm run check` — `astro check` (TypeScript + Astro)

Site URL (canonical / sitemap) resolves as:

`process.env.SITE_URL || process.env.PUBLIC_SITE_URL || 'https://grokbot-playbooks.pages.dev'`

## Add a case (one-file PR)

1. Create `src/content/cases/<slug>.json`.
2. Match the Zod schema in `src/content.config.ts`.
3. Required fields:
   - `slug`, `publishedAt` (ISO date), `order`, `tags[]`, `connectors[]`
   - `en` / `zh`: `title`, `category`, `summary`, `whyItWorks`, `workflowSteps` (3–5), `promptTemplate`, `connectorsAndRoutines`
   - `source`: `authorHandle`, `authorName`, `postUrl`, `postedAt`, `excerpt` (faithful to the source post)
4. Keep `category` in the small fixed set (EN: Operations, Productivity, Education, Health, Finance, Development, Personal — with matching ZH names).
5. Do not invent URLs, metrics, or claims not grounded in the source post.
6. Run `npm run check` and `npm run build`.

No other files need to change for a new case.

## Cloudflare Pages (GitHub org: jazfox-cloud)

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Framework preset | Astro (or None) |
| Env var | `SITE_URL` = your custom domain or `https://<project>.pages.dev` |

`public/_headers` ships basic security and cache headers for Pages.

Ads stay off by default (`src/config/site.ts` → `ads.enabled: false`). When enabled, only labeled placeholder boxes render—never third-party ad scripts.

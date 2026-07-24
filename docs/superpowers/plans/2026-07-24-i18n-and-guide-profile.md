# i18n + Guide-profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add en/es/it/vi multi-language support (URL-prefixed routing, Payload field-level localization, UI-microcopy translations, language switcher, hreflang SEO) plus in-scope Guide-profile fields, on a wiped DB with one fresh migration.

**Architecture:** next-intl drives locale-prefixed routing under `src/app/(frontend)/[locale]`. Payload `localization` config stores content translations field-level (`localized: true`); a `translations` collection stores UI microcopy as dot-notation key/value. `src/i18n/request.ts` merges 3 layers (EN JSON → locale JSON → DB) per request. All CMS getters take `locale` and include it in cache key + revalidate tag.

**Tech Stack:** Next.js 15 App Router, next-intl, Payload CMS 3 (@payloadcms/db-postgres), Postgres/Neon, Clerk, TypeScript.

## Global Constraints

- Locales: `en` (default), `es`, `it`, `vi`. `localePrefix: "always"` — even default locale is prefixed (`/en/...`).
- Single source of truth for the locale list: `src/i18n/routing.ts`. Every other file imports from it. Never hardcode the list twice.
- Payload `localization.fallback: true` — missing locale falls back to default, never renders empty.
- No test framework in repo. Per-task "test" = `npm run typecheck`, `npm run build`, `npx payload migrate`, and/or dev-server route checks. Never claim pass without running the command.
- DB test data is disposable: wipe + one fresh init migration. Delete old migration files.
- Package manager: npm. Dev server: `npm run dev` (port 9002).
- Commit after each task.

---

### Task 1: i18n core — dependency + routing source of truth + navigation

**Files:**
- Modify: `package.json` (add `next-intl`)
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/navigation.ts`

**Interfaces:**
- Produces: `locales` (`readonly ["en","es","it","vi"]`), `type AppLocale`, `defaultLocale: AppLocale`, `routing` from `src/i18n/routing.ts`. Locale-aware `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from `src/i18n/navigation.ts`.

- [ ] **Step 1: Install next-intl**

Run: `npm install next-intl@^3`
Expected: added to dependencies, no peer errors against next 15 / react 19.

- [ ] **Step 2: Create routing source of truth**

`src/i18n/routing.ts`:
```ts
import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'es', 'it', 'vi'] as const
export type AppLocale = (typeof locales)[number]
export const defaultLocale: AppLocale = 'en'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})
```

- [ ] **Step 3: Create locale-aware navigation primitives**

`src/i18n/navigation.ts`:
```ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors from the two new files).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/i18n/routing.ts src/i18n/navigation.ts
git commit -m "feat(i18n): add next-intl, routing source of truth, navigation primitives"
```

---

### Task 2: Payload schema — localization config, localized fields, translations collection, Guide fields, Tours.company

**Files:**
- Modify: `src/payload/payload.config.ts` (add `localization`, register `Translations`)
- Create: `src/payload/collections/Translations.ts`
- Modify: `src/payload/collections/Posts.ts` (localized fields, delete ad-hoc `locale`)
- Modify: `src/payload/collections/SiteConfig.ts` (Stories/Slides/NavigationMenus/SiteSettings)
- Modify: `src/payload/collections/Destinations.ts`
- Modify: `src/payload/collections/Tours.ts` (localized + `company`)
- Modify: `src/payload/collections/FAQs.ts`
- Modify: `src/payload/collections/MasterData.ts` (TourTypes)
- Modify: `src/payload/collections/Feedback.ts` (Reviews + Feedback)

**Interfaces:**
- Produces: Payload `localization` with locales `en/es/it/vi`, default `en`, `fallback: true`. New collection slug `translations`. Guides new fields `slogan`, `guideFeeUsd`, `showOnFrontend`, `socials` group, `spokenLanguages` array. Tours new field `company`.

- [ ] **Step 1: Add localization block to payload.config.ts**

Import routing to stay single-source. In `src/payload/payload.config.ts`, add near the top:
```ts
import { locales as appLocales, defaultLocale } from '../i18n/routing'
```
Add inside `buildConfig({ ... })` (sibling of `collections`):
```ts
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Español', code: 'es' },
      { label: 'Italiano', code: 'it' },
      { label: 'Tiếng Việt', code: 'vi' },
    ],
    defaultLocale,
    fallback: true,
  },
```
Guard: assert config matches routing (compile-time comfort), add below imports:
```ts
// Keep in sync with src/i18n/routing.ts
void (appLocales satisfies readonly ['en', 'es', 'it', 'vi'])
```

- [ ] **Step 2: Create Translations collection**

`src/payload/collections/Translations.ts`:
```ts
import type { CollectionConfig } from 'payload'

export const Translations: CollectionConfig = {
  slug: 'translations',
  access: { read: () => true },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'group', 'value'],
  },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true },
    { name: 'group', type: 'text' },
    { name: 'value', type: 'textarea', required: true, localized: true },
    { name: 'description', type: 'text' },
  ],
}
```

- [ ] **Step 3: Register Translations + confirm imports in payload.config.ts**

In `src/payload/payload.config.ts` add import:
```ts
import { Translations } from './collections/Translations'
```
Add `Translations,` to the `collections` array.

- [ ] **Step 4: Mark content fields localized + delete ad-hoc locale fields**

Add `localized: true` to these fields (edit each field object):
- `Posts.ts`: `title`, `content`, `excerpt`, `seo`. **Delete** the `locale` field (name `'locale'`, defaultValue `'en'`).
- `SiteConfig.ts` → Stories: `title`, `excerpt`, `content`; and the `tags` array's inner `tag` text field.
- `SiteConfig.ts` → Slides: `title`, `subtitle`, `buttonText`. **Delete** the `locale` field.
- `SiteConfig.ts` → NavigationMenus: the `items` array inner `label` field → add `localized: true`. **Delete** the top-level `locale` field.
- `SiteConfig.ts` → SiteSettings: `heroTitle`, `heroSubtitle`, `aboutTitle`, `aboutDescription`, `missionStatement`. **Delete** the `languages` array field and the `defaultLanguage` field.
- `Destinations.ts`: `name`, `summary`, `description`, `seo`; and inner `title`+`description` of `mustSee`/`mustDo`/`mustEat` arrays.
- `Tours.ts`: `name`, `summary`, `itinerary`; and inner `item` of `highlights`/`included`/`excluded` arrays.
- `FAQs.ts`: `question`, `answer`.
- `MasterData.ts` → TourTypes: `title`, `description`.
- `Feedback.ts` → Reviews: `message`, `summary`. Feedback: `message`, `feedbackSummary`.

Example edit shape (Posts title):
```ts
{ name: 'title', type: 'text', required: true, localized: true },
```

- [ ] **Step 5: Add Guide-profile fields + Tours.company**

In `src/payload/collections/Tours.ts`, `Guides` collection `fields`: add `slogan` after `bio`, and replace the plain `languages` relationship with `spokenLanguages` array. Add profile fields:
```ts
{ name: 'slogan', type: 'text', localized: true },
{ name: 'guideFeeUsd', label: 'Guide Fee (USD/day)', type: 'number', min: 0 },
{ name: 'showOnFrontend', type: 'checkbox', defaultValue: true },
{
  name: 'socials',
  type: 'group',
  fields: [
    { name: 'facebook', type: 'text' },
    { name: 'instagram', type: 'text' },
    { name: 'tiktok', type: 'text' },
    { name: 'whatsapp', type: 'text' },
    { name: 'zalo', type: 'text' },
    { name: 'viber', type: 'text' },
    { name: 'linkedin', type: 'text' },
  ],
},
{
  name: 'spokenLanguages',
  type: 'array',
  fields: [
    { name: 'language', type: 'relationship', relationTo: 'languages', required: true },
    {
      name: 'level',
      type: 'select',
      options: [
        { label: 'Basic', value: 'basic' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Fluent', value: 'fluent' },
        { label: 'Native', value: 'native' },
      ],
    },
    { name: 'certificate', type: 'text' },
  ],
},
```
Delete the old plain `languages` relationship field on `Guides`.

In the `Tours` collection `fields`, add after `code`:
```ts
{ name: 'company', label: 'Company', type: 'text' },
```

- [ ] **Step 6: Regenerate Payload types + typecheck**

Run: `npx payload generate:types`
Then: `npm run typecheck`
Expected: types regenerate; typecheck PASS. Fix any frontend references to deleted fields (`languages` on guides, `defaultLanguage`/`languages` on siteSettings, `locale` on posts/slides/nav) by grepping:
```bash
grep -rn "defaultLanguage\|\.languages\b" src/lib src/components "src/app/(frontend)"
```
Update call sites to `spokenLanguages` / removed fields as needed.

- [ ] **Step 7: Commit**

```bash
git add src/payload
git commit -m "feat(cms): add localization config, translations collection, localized content fields, guide-profile fields"
```

---

### Task 3: Wipe DB + single fresh init migration

**Files:**
- Delete: `src/migrations/20260722_031427_init.ts`, `src/migrations/20260722_031427_init.json`, and any other stale migration pair
- Modify: `src/migrations/index.ts` (regenerated)
- Create: new `src/migrations/<timestamp>_init.{ts,json}`

**Interfaces:**
- Produces: a clean DB whose schema matches Task 2, one init migration.

- [ ] **Step 1: Drop the database schema**

Confirm `DATABASE_URI` points at the disposable test DB (Neon branch). Then reset:
```bash
npx payload migrate:reset
```
Expected: all tables dropped. (If it errors because migrations are out of sync, drop the `public` schema directly via psql/Neon console, then continue.)

- [ ] **Step 2: Delete old migration files**

```bash
git rm src/migrations/20260722_031427_init.ts src/migrations/20260722_031427_init.json
```
Leave `src/migrations/index.ts` — it gets rewritten by create.

- [ ] **Step 3: Create fresh init migration**

Run: `npx payload migrate:create init`
Expected: new `src/migrations/<ts>_init.ts` + `.json`, `index.ts` updated to export only it.

- [ ] **Step 4: Run migration against clean DB**

Run: `npx payload migrate`
Expected: init migration applies clean; tables created incl. `translations`, `_locales`-style localized columns/tables, new guide fields, `tours.company`.

- [ ] **Step 5: Commit**

```bash
git add src/migrations
git commit -m "chore(db): wipe test data, regenerate single init migration with localization schema"
```

---

### Task 4: i18n request config + message files + middleware

**Files:**
- Create: `src/i18n/request.ts`
- Create: `src/i18n/db-messages.ts`
- Create: `src/i18n/messages/en/common.json`
- Create: `src/i18n/messages/es/common.json`
- Create: `src/i18n/messages/it/common.json`
- Create: `src/i18n/messages/vi/common.json`
- Modify: `src/middleware.ts`
- Modify: `next.config.ts` (wrap with next-intl plugin)

**Interfaces:**
- Consumes: `routing` (Task 1), Payload client `getPayloadClient` (from `src/lib/payload.ts`).
- Produces: default export `getRequestConfig` for next-intl; `getDbMessages(locale)` never-throws; composed middleware.

- [ ] **Step 1: Create static EN message seed**

`src/i18n/messages/en/common.json`:
```json
{
  "nav": { "home": "Home", "tours": "Tours", "destinations": "Destinations", "blog": "Blog", "stories": "Stories", "faq": "FAQ", "reviews": "Reviews", "contact": "Contact" },
  "common": { "readMore": "Read more", "loading": "Loading…", "submit": "Submit", "search": "Search" },
  "footer": { "tagline": "Professional tour guide portfolio" }
}
```

- [ ] **Step 2: Create es/it/vi seeds (same keys, translated)**

`src/i18n/messages/es/common.json`:
```json
{
  "nav": { "home": "Inicio", "tours": "Tours", "destinations": "Destinos", "blog": "Blog", "stories": "Historias", "faq": "Preguntas", "reviews": "Reseñas", "contact": "Contacto" },
  "common": { "readMore": "Leer más", "loading": "Cargando…", "submit": "Enviar", "search": "Buscar" },
  "footer": { "tagline": "Portafolio profesional de guía turístico" }
}
```
`src/i18n/messages/it/common.json`:
```json
{
  "nav": { "home": "Home", "tours": "Tour", "destinations": "Destinazioni", "blog": "Blog", "stories": "Storie", "faq": "FAQ", "reviews": "Recensioni", "contact": "Contatti" },
  "common": { "readMore": "Leggi di più", "loading": "Caricamento…", "submit": "Invia", "search": "Cerca" },
  "footer": { "tagline": "Portfolio professionale di guida turistica" }
}
```
`src/i18n/messages/vi/common.json`:
```json
{
  "nav": { "home": "Trang chủ", "tours": "Tour", "destinations": "Điểm đến", "blog": "Blog", "stories": "Câu chuyện", "faq": "Hỏi đáp", "reviews": "Đánh giá", "contact": "Liên hệ" },
  "common": { "readMore": "Xem thêm", "loading": "Đang tải…", "submit": "Gửi", "search": "Tìm kiếm" },
  "footer": { "tagline": "Hồ sơ hướng dẫn viên chuyên nghiệp" }
}
```

- [ ] **Step 3: DB message loader (never throws)**

`src/i18n/db-messages.ts`:
```ts
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getPayloadClient } from '@/lib/payload'

export const TRANSLATIONS_TAG = 'translations'

function setByPath(root: Record<string, unknown>, path: string, value: string) {
  const parts = path.split('.')
  let node = root
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    if (typeof node[k] !== 'object' || node[k] === null) node[k] = {}
    node = node[k] as Record<string, unknown>
  }
  node[parts[parts.length - 1]] = value
}

async function fetchTranslations(locale: string): Promise<Record<string, unknown>> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({ collection: 'translations', locale, limit: 1000, depth: 0 })
    const out: Record<string, unknown> = {}
    for (const row of res.docs as Array<{ key?: string; value?: string }>) {
      if (row.key && typeof row.value === 'string') setByPath(out, row.key, row.value)
    }
    return out
  } catch {
    return {}
  }
}

const getDbMessagesCached = cache((locale: string) =>
  unstable_cache(() => fetchTranslations(locale), ['cms', 'translations', locale], {
    tags: [TRANSLATIONS_TAG],
  })(),
)

export function getDbMessages(locale: string): Promise<Record<string, unknown>> {
  return getDbMessagesCached(locale)
}
```
Note: verify the exported client fn name in `src/lib/payload.ts` (Step 4) and match it here.

- [ ] **Step 4: Confirm payload client export name**

Run: `grep -n "export" src/lib/payload.ts`
If the getter is named differently (e.g. `getPayload`), update the import in `db-messages.ts` accordingly. Expected: one exported async client getter.

- [ ] **Step 5: request.ts — 3-layer merge**

`src/i18n/request.ts`:
```ts
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'
import { getDbMessages } from './db-messages'

type Dict = Record<string, unknown>

function deepMerge(base: Dict, over: Dict): Dict {
  const out: Dict = { ...base }
  for (const [k, v] of Object.entries(over)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof out[k] === 'object') {
      out[k] = deepMerge(out[k] as Dict, v as Dict)
    } else {
      out[k] = v
    }
  }
  return out
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const [enDefaults, localeDefaults, dbMessages] = await Promise.all([
    import('./messages/en/common.json').then((m) => m.default as Dict),
    locale === 'en'
      ? Promise.resolve({} as Dict)
      : import(`./messages/${locale}/common.json`).then((m) => m.default as Dict),
    getDbMessages(locale),
  ])

  return { locale, messages: deepMerge(deepMerge(enDefaults, localeDefaults), dbMessages) }
})
```

- [ ] **Step 6: Wrap next.config with next-intl plugin**

In `src/../next.config.ts` (repo root `next.config.ts`), wrap the export:
```ts
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
// ... existing config object as `nextConfig`
export default withNextIntl(nextConfig)
```
Keep any existing Payload `withPayload` wrapping — compose: `export default withNextIntl(withPayload(nextConfig))`.

- [ ] **Step 7: Compose middleware (next-intl + Clerk)**

`src/middleware.ts`:
```ts
import createIntlMiddleware from 'next-intl/middleware'
import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'
import { clerkEnabled } from '@/lib/clerk'

const intlMiddleware = createIntlMiddleware(routing)

const handler = clerkEnabled
  ? clerkMiddleware((_auth, req: NextRequest) => intlMiddleware(req))
  : (req: NextRequest) => intlMiddleware(req)

export default handler

export const config = {
  matcher: ['/((?!admin|api|_next|.*\\..*).*)'],
}
```

- [ ] **Step 8: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS. (Build may warn about pages moving in Task 5 — if `[locale]` layout not yet present, defer full build check to Task 5; typecheck must pass here.)

- [ ] **Step 9: Commit**

```bash
git add src/i18n src/middleware.ts next.config.ts
git commit -m "feat(i18n): request config 3-layer merge, message seeds, composed middleware"
```

---

### Task 5: Restructure frontend routes under [locale]

**Files:**
- Move: all of `src/app/(frontend)/*` (pages/layouts/route dirs) → `src/app/(frontend)/[locale]/*`
- Modify: `src/app/(frontend)/[locale]/layout.tsx` (add `NextIntlClientProvider`, `setRequestLocale`, `generateStaticParams`)
- Keep: `src/app/(frontend)/globals.css` import path
- Modify: import sites using `next/link` / `next/navigation` → `@/i18n/navigation`

**Interfaces:**
- Consumes: `routing` (Task 1), `request.ts` (Task 4).
- Produces: working locale-prefixed routes `/en`, `/es`, `/it`, `/vi`.

- [ ] **Step 1: Create the [locale] dir and move routes**

```bash
cd "src/app/(frontend)"
mkdir "[locale]"
git mv about blog contact destinations faq feedback finished-tours guide guides page.tsx privacy reviews search stories terms tour-types tours "[locale]/"
```
Keep `layout.tsx` and `globals.css` at `(frontend)` root for now (Step 2 decides).

- [ ] **Step 2: Locale layout**

Create `src/app/(frontend)/[locale]/layout.tsx` (move shared providers from the old `(frontend)/layout.tsx` here):
```tsx
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
```
Keep the outer `(frontend)/layout.tsx` minimal (html/body/fonts/globals.css) OR, if the existing root uses `src/app/layout.tsx`, fold the html shell there and make `[locale]/layout.tsx` return only the provider wrapper. Match the existing structure — check where `<html>` currently lives:
```bash
grep -rln "<html" src/app
```

- [ ] **Step 3: Swap link/navigation imports**

Find frontend components importing from `next/link` or `next/navigation` for routing:
```bash
grep -rln "from 'next/link'\|from \"next/link\"\|from 'next/navigation'" src/components "src/app/(frontend)"
```
Replace `import Link from 'next/link'` → `import { Link } from '@/i18n/navigation'`, and `useRouter/usePathname/redirect` from `next/navigation` → `@/i18n/navigation` (keep `useSearchParams`/`useParams` from `next/navigation` — those aren't re-exported).

- [ ] **Step 4: Root-path redirect for bare `/`**

next-intl middleware handles `/` → `/en` automatically via `localePrefix: always`. Verify no static `src/app/(frontend)/page.tsx` remains at the non-locale root (it was moved in Step 1).

- [ ] **Step 5: Build + dev route check**

Run: `npm run build`
Expected: PASS; routes compiled under `/[locale]`.
Then `npm run dev` and check:
```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:9002/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9002/en
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9002/vi
```
Expected: `/` → 307 to `/en`; `/en` and `/vi` → 200.

- [ ] **Step 6: Commit**

```bash
git add -A "src/app" src/components
git commit -m "feat(i18n): move frontend routes under [locale], locale layout, locale-aware links"
```

---

### Task 6: Locale-aware data getters (cache key + tag include locale)

**Files:**
- Modify: `src/lib/content-service.ts`
- Modify: `src/lib/blog.ts`
- Create: `src/lib/locale.ts` (helper `asLocale`, `DEFAULT_LOCALE`, `localeKey`)
- Modify: page files under `[locale]` to pass `params.locale` into getters

**Interfaces:**
- Consumes: `AppLocale`, `defaultLocale` (Task 1), Payload client.
- Produces: every exported getter accepts `locale?: AppLocale`; slug getters match at default locale then load target locale.

- [ ] **Step 1: Locale helper**

`src/lib/locale.ts`:
```ts
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'

export const DEFAULT_LOCALE = defaultLocale

export function asLocale(value?: string): AppLocale {
  return (locales as readonly string[]).includes(value ?? '')
    ? (value as AppLocale)
    : defaultLocale
}

export function localeKey(locale?: string): AppLocale {
  return asLocale(locale)
}
```

- [ ] **Step 2: Thread locale through one getter (pattern) — tours by slug**

In `src/lib/content-service.ts`, locate the tour-by-slug getter. Convert to the md §4 pattern:
```ts
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { asLocale, localeKey } from '@/lib/locale'
import type { AppLocale } from '@/i18n/routing'

async function fetchTourBySlug(slug: string, locale: AppLocale) {
  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: 'tours', where: { slug: { equals: slug } }, locale: 'en', limit: 1,
  })
  const id = found.docs[0]?.id
  if (!id) return null
  return payload.findByID({ collection: 'tours', id, depth: 1, locale })
}

const getTourBySlugCached = cache((slug: string, locale: AppLocale) =>
  unstable_cache(() => fetchTourBySlug(slug, locale), ['cms', 'tour', slug, locale], {
    tags: ['tours', `tour-${slug}`, `${locale}-tour-${slug}`],
  })(),
)

export function getTourBySlug(slug: string, locale?: string) {
  return getTourBySlugCached(slug, localeKey(locale))
}
```
(Note: `tours` currently has no `slug` field — if it uses `code` or id, match on that field instead. Verify with `grep -n "slug\|code" src/payload/collections/Tours.ts`. Use whatever unique field the route already uses.)

- [ ] **Step 3: Apply same pattern to all other content getters**

For each exported getter in `content-service.ts` and `blog.ts` (posts, stories, destinations, faqs, tour-types, reviews list, guides): add `locale?: string` param, pass `locale` into the Payload `find`/`findByID`, and include `locale` in the `unstable_cache` key array and add a `${locale}-...` tag. List getters (no slug) just add `locale` to key + a locale tag. Keep existing generic tags.

- [ ] **Step 4: Pass locale from pages**

In each `src/app/(frontend)/[locale]/**/page.tsx`, read `const { locale } = await params` and pass to getters, e.g. `getTourBySlug(slug, locale)`. Add `setRequestLocale(locale)` at the top of each page/generateMetadata for static rendering.

- [ ] **Step 5: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib "src/app/(frontend)"
git commit -m "feat(i18n): locale-aware CMS getters with locale in cache key and tags"
```

---

### Task 7: Language switcher + hreflang SEO + sitemap

**Files:**
- Create: `src/lib/locale-path.ts`
- Create: `src/components/language-switcher.tsx`
- Modify: `src/components/header.tsx` (render switcher)
- Modify: `generateMetadata` in `[locale]/layout.tsx` and key pages (alternates)
- Modify: sitemap route if present (`src/app/sitemap.ts` or equivalent)

**Interfaces:**
- Consumes: `locales`, `defaultLocale` (Task 1), navigation (Task 1).
- Produces: `buildAlternates(baseUrl, path)`, `LanguageSwitcher` component.

- [ ] **Step 1: locale-path helpers**

`src/lib/locale-path.ts`:
```ts
import { locales, defaultLocale } from '@/i18n/routing'

function localizedPath(locale: string, path = '/'): string {
  const normalized = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return `/${locale}${normalized}`
}

export function localizedUrl(baseUrl: string, locale: string, path = '/'): string {
  return `${baseUrl.replace(/\/$/, '')}${localizedPath(locale, path)}`
}

export function buildAlternates(baseUrl: string, path = '/'): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const locale of locales) languages[locale] = localizedUrl(baseUrl, locale, path)
  languages['x-default'] = localizedUrl(baseUrl, defaultLocale, path)
  return languages
}
```

- [ ] **Step 2: LanguageSwitcher component**

`src/components/language-switcher.tsx`:
```tsx
'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, type AppLocale } from '@/i18n/routing'

const LABELS: Record<AppLocale, string> = {
  en: 'English', es: 'Español', it: 'Italiano', vi: 'Tiếng Việt',
}

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const pathname = usePathname()

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value as AppLocale })}
      className="rounded border bg-transparent px-2 py-1 text-sm"
    >
      {locales.map((l) => (
        <option key={l} value={l}>{LABELS[l]}</option>
      ))}
    </select>
  )
}
```

- [ ] **Step 3: Render switcher in header**

In `src/components/header.tsx`, import and render `<LanguageSwitcher />` in the header actions area (near search/nav). Import: `import { LanguageSwitcher } from '@/components/language-switcher'`.

- [ ] **Step 4: hreflang alternates in metadata**

In `src/app/(frontend)/[locale]/layout.tsx`, add:
```ts
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/locale-path'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'
  return { alternates: { languages: buildAlternates(siteUrl, '/') } }
}
```
For dynamic content pages, pass the resolved path (e.g. `/tours/${slug}`) to `buildAlternates`.

- [ ] **Step 5: Sitemap per-locale (if sitemap exists)**

Check: `ls src/app/sitemap.ts 2>/dev/null`. If present, loop `locales` for each entry so every URL is emitted with its locale prefix. If absent, skip (out of scope).

- [ ] **Step 6: Build + manual switch check**

Run: `npm run build` → PASS.
`npm run dev`, load `/en`, use switcher → lands on `/es` same path. View source: `<link rel="alternate" hreflang="es" ...>` present for all 4 + x-default.

- [ ] **Step 7: Commit**

```bash
git add src/lib/locale-path.ts src/components "src/app/(frontend)"
git commit -m "feat(i18n): language switcher, hreflang alternates, locale-aware sitemap"
```

---

### Task 8: Seed update — EN baseline + idempotent copy-to-locale

**Files:**
- Modify: `src/payload/seed.ts`
- Create: `src/payload/seed-translations.ts` (translations rows from EN JSON)

**Interfaces:**
- Consumes: Payload client, `locales`/`defaultLocale`.
- Produces: seeded DB with EN content + all locales fallback-populated; `translations` rows for UI microcopy keys.

- [ ] **Step 1: Seed translations collection from EN JSON**

`src/payload/seed-translations.ts` — flatten `messages/en/common.json` to dot-keys, upsert into `translations` (locale `en`):
```ts
import type { Payload } from 'payload'
import en from '../i18n/messages/en/common.json'

function flatten(obj: Record<string, unknown>, prefix = ''): Array<[string, string]> {
  const out: Array<[string, string]> = []
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object') out.push(...flatten(v as Record<string, unknown>, key))
    else out.push([key, String(v)])
  }
  return out
}

export async function seedTranslations(payload: Payload) {
  for (const [key, value] of flatten(en as Record<string, unknown>)) {
    const existing = await payload.find({ collection: 'translations', where: { key: { equals: key } }, limit: 1 })
    if (existing.docs.length) continue
    await payload.create({
      collection: 'translations',
      locale: 'en',
      data: { key, group: key.split('.')[0], value },
    })
  }
}
```

- [ ] **Step 2: Idempotent copy-to-locale helper**

Add to `src/payload/seed.ts` (md §7). After creating EN content docs, for listed collections/fields copy EN → es/it/vi only where empty:
```ts
import { locales, defaultLocale } from '../i18n/routing'

const isEmpty = (v: unknown) =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)

// per-collection localized text fields to baseline-copy
const LOCALIZED_FIELDS: Record<string, string[]> = {
  posts: ['title', 'excerpt'],
  stories: ['title', 'excerpt'],
  destinations: ['name', 'summary'],
  tours: ['name', 'summary'],
  faqs: ['question'],
  'tour-types': ['title', 'description'],
}

async function copyLocaleBaseline(payload: Payload, collection: string, id: string | number) {
  const en = await payload.findByID({ collection, id, locale: defaultLocale, fallbackLocale: false, depth: 0 })
  const fields = LOCALIZED_FIELDS[collection] ?? []
  for (const locale of locales) {
    if (locale === defaultLocale) continue
    const cur = await payload.findByID({ collection, id, locale, fallbackLocale: false, depth: 0 })
    const data: Record<string, unknown> = {}
    for (const f of fields) if (isEmpty((cur as Record<string, unknown>)[f]) && !isEmpty((en as Record<string, unknown>)[f])) data[f] = (en as Record<string, unknown>)[f]
    if (Object.keys(data).length) await payload.update({ collection, id, locale, data })
  }
}
```
Call `copyLocaleBaseline` for each created doc, and `seedTranslations(payload)` once, at the end of the seed run.

- [ ] **Step 3: Run seed**

Run: `npm run seed` (or the project's seed command — check `package.json` scripts; if none, `npx tsx src/payload/seed.ts`).
Expected: completes; no `id`-collision errors (fields copied are scalar text only — arrays with ids are excluded from `LOCALIZED_FIELDS`).

- [ ] **Step 4: Verify in admin + frontend**

`npm run dev`: open `/admin`, edit a Post, toggle locale dropdown es/it/vi → EN baseline present. Frontend `/vi/blog` renders (fallback where untranslated).

- [ ] **Step 5: Commit**

```bash
git add src/payload/seed.ts src/payload/seed-translations.ts
git commit -m "feat(seed): EN baseline copy-to-locale + translations microcopy seed"
```

---

## Self-Review notes

- **Spec coverage:** locales (T1,T2), Payload localization (T2), translations collection (T2,T4,T8), routing restructure (T5), request 3-layer merge (T4), data-layer locale cache (T6), switcher+SEO (T7), migration/wipe (T3), seed (T8), Guide fields + Tours.company (T2). All spec sections mapped.
- **No test framework:** verification via typecheck/build/migrate/curl/admin — stated in Global Constraints and each task.
- **Ordering risk:** T3 (migration) after T2 (schema) — correct. T5 build check depends on T4 middleware/config — noted.
- **Unknowns flagged inline for the implementer to confirm:** payload client export name (T4.S4), tours slug/code field (T6.S2), html-shell location (T5.S2), seed script command (T8.S3). Each has a grep to resolve, not a placeholder.

# Design: Multi-language (i18n) + Guide-profile fields

Date: 2026-07-24
Status: Approved

## Context

Tour Insights Hub (Next.js 15 App Router + Payload CMS 3 + Postgres/Neon, Clerk auth,
S3/R2 media). Goal per `docs/yêu-cầu.docx`: evolve into a Professional Tour Guide
Portfolio & Personal Branding Platform across three pillars — Professional Profile,
Trust & Reputation, Knowledge & Content. The biggest missing pillar element is
**multi-language**. This spec covers i18n implementation (blueprint:
`docs/multi-languages.md`) plus a set of cheap, in-scope Guide-profile fields.

Test data is disposable — we wipe the DB and regenerate a single fresh migration.

## Decisions (locked)

- **Locales**: `en` (default), `es`, `it`, `vi`. `localePrefix: "always"`.
- **Scope this cycle**: full i18n infra + Guide-profile quick fields. Other feature
  gaps (Diaries, Portfolio, Gallery, Statistics, Availability, Booking, CV, Skills,
  Badges, review source-tabs UI) are deferred to their own specs.
- **DB**: wipe test data, drop existing ad-hoc `locale` fields, adopt Payload
  field-level `localized: true`, regenerate one init migration, re-seed.

## Non-goals

- Per-locale slugs (slug stays single; default-locale match + Payload fallback).
- Translating existing seed content into es/it/vi by hand (seed copies EN baseline;
  human translation happens later in Payload admin).
- The deferred feature gaps listed above.

## Architecture

### Locale source of truth
`src/i18n/routing.ts` exports `locales`, `AppLocale`, `defaultLocale`, `routing`
(next-intl `defineRouting`, `localePrefix: "always"`). Every consumer imports from
here: Payload config locale list, middleware matcher, navigation primitives, language
switcher, SEO alternates. Never hardcode the locale list twice.

Add dependency: `next-intl`.

### Payload localization
`payload.config.ts` gains:
```ts
localization: {
  locales: [
    { label: "English", code: "en" },
    { label: "Español", code: "es" },
    { label: "Italiano", code: "it" },
    { label: "Tiếng Việt", code: "vi" },
  ],
  defaultLocale: "en",
  fallback: true,
}
```

Fields set `localized: true` (content, md §2a). Delete ad-hoc `locale` text fields on
Posts, Slides, NavigationMenus and `defaultLanguage`/`languages` array on SiteSettings.

| Collection | Localized fields |
|---|---|
| Posts | title, content, excerpt, seo |
| Stories | title, excerpt, content, tags |
| Destinations | name, summary, description, mustSee/mustDo/mustEat (title+description), seo |
| Tours | name, summary, itinerary, highlights/included/excluded (item) |
| FAQs | question, answer |
| TourTypes | title, description |
| Reviews | message, summary |
| Feedback | message, feedbackSummary |
| Slides | title, subtitle, buttonText |
| Guides | bio, slogan |
| SiteSettings | heroTitle, heroSubtitle, aboutTitle, aboutDescription, missionStatement |
| NavigationMenus | item.label |

### `translations` collection (UI microcopy, md §2b)
Fields: `key` (text, required, unique — dot-notation e.g. `footer.tagline`),
`group` (text), `value` (textarea, required, localized), `description` (text).
Runtime reassembles nested object for next-intl by dot-path.

### Routing restructure
Move `src/app/(frontend)/*` → `src/app/(frontend)/[locale]/*`.

New files:
- `src/i18n/navigation.ts` — `createNavigation(routing)` → locale-aware `Link`,
  `redirect`, `usePathname`, `useRouter`, `getPathname`.
- `src/i18n/request.ts` — `getRequestConfig`; 3-layer merge (EN JSON → locale JSON →
  DB translations), DB layer never throws.
- `src/i18n/messages/{en,es,it,vi}/common.json` — static seed / offline fallback.
- `src/middleware.ts` — compose next-intl middleware with existing Clerk logic;
  matcher excludes `admin`, `api`, `_next`, dotted files.

### Data layer
Getters in `lib/content-service.ts`, `lib/blog.ts`, etc. accept `locale?: AppLocale`.
Cache key AND revalidate tag include locale (md §4). Slug resolution: match slug at
default locale to obtain `id`, then `findByID` at target locale.

### UI + SEO
- `LanguageSwitcher` client component using `useLocale` + `router.replace(pathname,
  { locale })`; rendered in header.
- `lib/locale-path.ts` — `localizedUrl`, `buildAlternates` (hreflang incl. `x-default`)
  for `generateMetadata`. Sitemap getters loop locales.

### Guide-profile quick fields (in-scope)
Guides collection additions:
- `slogan` — text, localized
- `guideFeeUsd` — number (USD/day)
- `showOnFrontend` — checkbox, default true
- `socials` — group: facebook, instagram, tiktok, whatsapp, zalo, viber, linkedin
  (all text)
- replace plain `languages` relationship with array `spokenLanguages`:
  `{ language: relationship→languages, level: select(basic/intermediate/fluent/native),
  certificate: text }`

Tours collection: add `company` — text (tour-history "Company" filter).

### Migration + seed
1. Wipe DB (drop schema / fresh Neon branch).
2. Delete `src/migrations/*` old files.
3. `payload migrate:create` → single fresh init migration.
4. Update `src/payload/seed.ts`: write EN baseline, then idempotent copy-to-locale
   pass (md §7) — read with `fallbackLocale: false`, skip non-empty, strip nested
   `id` before writing other locales.

## Verification

- `npm run build` succeeds; `payload migrate` runs clean on fresh DB.
- Admin shows 4-locale dropdown; localized fields switch per locale.
- `/en`, `/es`, `/it`, `/vi` routes resolve; `/` redirects to `/en`.
- Language switcher preserves current path.
- `generateMetadata` emits hreflang alternates for all 4 locales.
- Guides admin shows new fields; `showOnFrontend=false` hides guide on frontend.

## Risks

- Route restructure touches every frontend page — do it as one mechanical move, fix
  imports (`next/link`→`@/i18n/navigation`) collection-wide.
- Composing next-intl + Clerk middleware ordering: run i18n routing first, Clerk after
  (or gate Clerk to non-asset paths).
- Payload localized array `id` ownership per locale — seed script must strip ids.

# Multi-language (i18n) Design Guide

Rút ra từ implementation thực tế trong dự án này (Next.js App Router + next-intl + Payload CMS). Dùng làm blueprint cho website khác — copy pattern, đổi tech stack detail nếu cần.

Stack tham chiếu: Next.js 15 App Router, `next-intl`, Payload CMS (Postgres/Neon), Netlify.

---

## 1. Nguyên tắc thiết kế

1. **URL locale-prefixed luôn luôn** (`localePrefix: "always"`) — kể cả default locale (`/en/tours`, không phải `/tours`). Lý do: hreflang/canonical generation đồng nhất, không có ambiguity "locale nào đang serve root path".
2. **1 nguồn sự thật cho danh sách locale** — định nghĩa locales ở đúng 1 file, mọi nơi khác import từ đó (routing config, CMS localization config, next.config matcher, language switcher UI). KHÔNG hardcode locale list ở 2 nơi — dễ lệch.
3. **3-layer fallback cho UI strings**: JSON tĩnh (English) → JSON tĩnh (locale đó) → DB (Payload, nguồn sự thật, ghi đè). Không bao giờ để 1 key render rỗng.
4. **Content (tour/blog/page) khác UI microcopy (button/label/footer)** — 2 cơ chế lưu trữ khác nhau (xem mục 2).
5. **Slug là localized nhưng chỉ default locale được đảm bảo có** — luôn match slug ở default locale trước, rồi load content ở locale đích (Payload fallback lo phần còn thiếu).
6. **Cache key + revalidate tag phải chứa locale** — nếu không, edit tiếng Pháp sẽ vô tình invalidate/serve nhầm cache tiếng Anh.
7. **Middleware auto-redirect + matcher loại trừ đúng path** — admin, api, static file, Next internals không đi qua i18n routing.

---

## 2. Lưu trữ nội dung đa ngôn ngữ

### 2a. Content lớn (tour, blog post, destination...) → Payload `localized: true` field-level

```ts
// payload.config.ts
localization: {
  locales: [
    { label: "English", code: "en" },
    { label: "Français", code: "fr" },
    { label: "Español", code: "es" },
    { label: "Deutsch", code: "de" },
    { label: "Italiano", code: "it" },
    { label: "Português", code: "pt" },
    { label: "简体中文", code: "zh-Hans" },
    { label: "繁體中文", code: "zh-Hant" }
  ],
  defaultLocale: "en",
  fallback: true   // thiếu locale nào → tự fallback default locale, KHÔNG render rỗng
}
```

Trong collection field:

```ts
{ name: "title", type: "text", localized: true }
{ name: "description", type: "textarea", localized: true }
```

Payload lưu 1 row/document, mỗi field localized có N giá trị theo locale (không phải N document riêng). Query bằng `locale: "fr"` để lấy bản Pháp; thiếu thì `fallback: true` trả về default.

Array/group con cũng localize theo field bên trong — nhưng field `id` của mỗi row array KHÔNG chia sẻ giữa locale (mỗi locale sở hữu id riêng), quan trọng khi seed/copy dữ liệu (mục 4).

### 2b. UI microcopy (nút bấm, label, footer, cookie banner...) → dot-notation key/value collection

Tách riêng 1 collection `translations`:

```ts
fields: [
  { name: "key", type: "text", required: true, unique: true }, // "footer.tagline"
  { name: "group", type: "text" },                              // auto = prefix trước dấu chấm đầu
  { name: "value", type: "textarea", required: true, localized: true },
  { name: "description", type: "text" }                         // context cho translator
]
```

Lý do tách riêng khỏi content collection: content editor sửa tour, translator sửa UI copy — 2 workflow khác nhau, không muốn lẫn.

Runtime build lại thành nested object cho next-intl (`footer.tagline` → `{footer:{tagline:...}}`) bằng cách loop toàn bộ rows 1 locale rồi gán theo dot-path.

### 2c. Static JSON seed (per-locale file) → fallback offline + giá trị khởi tạo

```
src/i18n/messages/en/common.json
src/i18n/messages/fr/common.json
...
```

Vai trò: (1) fallback khi DB chưa migrate/seed hoặc DB down, (2) baseline để dev không cần DB mới chạy được UI tiếng Anh.

---

## 3. Routing layer (next-intl)

`src/i18n/routing.ts` — single source of truth cho locale list:

```ts
import { defineRouting } from "next-intl/routing";

export const locales = ["en", "fr", "es", "de", "it", "pt", "zh-Hans", "zh-Hant"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always"
});
```

`src/i18n/navigation.ts` — locale-aware primitives, dùng thay vì `next/link`, `next/navigation`:

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

`useRouter().replace(pathname, { locale: next })` giữ nguyên path, chỉ đổi locale prefix.

`src/middleware.ts`:

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|admin|internal|_next|.*\\..*).*)"]
};
```

Matcher loại: API routes, CMS admin, Next internals, mọi path có file extension (`.xml`, `.txt`...) — tránh middleware redirect nhầm crawler/asset request.

**Gotcha**: file kiểu `/llms.txt` sống ở conventional root nhưng nội dung phải locale-aware → route thật nằm trong `src/app/[locale]/llms.txt/route.ts`, còn `src/app/llms.txt/route.ts` chỉ redirect 308 sang `/{defaultLocale}/llms.txt` (vì middleware skip dotted path nên request root không match route nào, dễ 500 nếu quên).

`src/i18n/request.ts` — nơi merge 3 layer message + set locale cho request:

```ts
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [enDefaults, localeDefaults, dbMessages] = await Promise.all([
    import(`./messages/en/common.json`).then((m) => m.default),
    locale === "en" ? Promise.resolve({}) : import(`./messages/${locale}/common.json`).then((m) => m.default),
    getDbMessages(locale)
  ]);

  return { locale, messages: deepMerge(deepMerge(enDefaults, localeDefaults), dbMessages) };
});
```

Thứ tự merge = độ ưu tiên tăng dần: English JSON (never empty) → locale JSON (offline seed) → DB (editable, thắng cuối).

---

## 4. Lấy dữ liệu (data-fetching) đa ngôn ngữ — cache đúng cách

Nguyên tắc: **mọi CMS getter nhận optional `locale`, cache key + revalidate tag phải include locale**.

```ts
function localeKey(locale?: string): Locale {
  return locale ?? DEFAULT_LOCALE;
}

async function fetchTourBySlug(slug: string, locale?: Locale): Promise<Tour | null> {
  // Slug chỉ đảm bảo có ở default locale; Payload `where` KHÔNG áp dụng locale
  // fallback. Match slug ở default locale trước để lấy `id`, rồi load content
  // theo locale đích bằng findByID.
  const payload = await getPayloadClient();
  const found = await payload.find({ collection: "tours", where: { slug: { equals: slug } }, locale: "en", limit: 1 });
  const id = found.docs[0]?.id;
  if (!id) return null;
  return payload.findByID({ collection: "tours", id, depth: 1, locale: asLocale(locale) }) as Promise<Tour>;
}

const getTourBySlugCached = cache((slug: string, locale: Locale) =>
  unstable_cache(() => fetchTourBySlug(slug, locale), ["cms", "tour", slug, locale], {
    tags: ["tours", `tour-${slug}`, `${locale}-tour-${slug}`]
  })()
);

export function getTourBySlug(slug: string, locale?: Locale): Promise<Tour | null> {
  return getTourBySlugCached(slug, localeKey(locale));
}
```

Điểm quan trọng:
- `["cms", "tour", slug, locale]` — locale nằm trong cache key → mỗi locale cache riêng.
- Tag `${locale}-tour-${slug}` — cho phép revalidate đúng 1 locale mà không đụng locale khác, cộng với tag chung `tours`/`tour-${slug}` để revalidate toàn bộ khi cần.
- KHÔNG bao giờ gọi `payload.find()`/`findByID` trực tiếp trong render path — luôn qua getter đã wrap `unstable_cache`.

UI strings (translations collection) cũng cùng nguyên tắc — cache theo locale, tag chung `translations` để 1 lần edit refresh hết:

```ts
const getDbMessagesCached = cache((locale: string) =>
  unstable_cache(() => fetchTranslations(locale), ["cms", "translations", locale], { tags: [TRANSLATIONS_TAG] })()
);
```

Getter này **never throws** — DB chưa migrate/seed thì degrade về `{}`, để JSON fallback gánh UI thay vì crash trang.

---

## 5. SEO đa ngôn ngữ (hreflang, canonical, sitemap)

Helper build URL + alternates dùng chung mọi page:

```ts
// src/lib/locale-path.ts
function localizedPath(locale: string, path = "/"): string {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

export function localizedUrl(baseUrl: string, locale: string, path = "/"): string {
  return `${baseUrl.replace(/\/$/, "")}${localizedPath(locale, path)}`;
}

export function buildAlternates(baseUrl: string, path = "/"): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = localizedUrl(baseUrl, locale, path);
  languages["x-default"] = localizedUrl(baseUrl, defaultLocale, path);
  return languages;
}
```

Dùng trong `generateMetadata`: `alternates: { languages: buildAlternates(siteUrl, path) }`.

Sitemap: mỗi content getter (`getTourSitemapEntries`, `getDestinationSitemapEntries`...) nhận `locale`, cache theo `["cms","sitemap","tours",limit,locale]` — loop tất cả locale để build sitemap index đầy đủ hreflang.

---

## 6. UI: Language switcher

```tsx
"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type AppLocale, locales } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname(); // locale-stripped, giữ nguyên dynamic segment (/tours/abc)

  function onChange(next: AppLocale) {
    router.replace(pathname, { locale: next }); // giữ nguyên trang, chỉ đổi locale
  }
  // render <select> loop qua `locales`
}
```

Gotcha: `usePathname()` trả path đã resolve dynamic segment (vd `/tours/abc`) nhưng **slug không được re-map theo locale** — nếu tour "abc" chỉ có slug tiếng Anh, chuyển sang `/fr/tours/abc` vẫn dùng slug đó, Payload fallback lo phần content bên trong. Nếu muốn slug riêng theo locale (SEO tốt hơn) phải tự làm slug-mapping table — dự án này chưa làm.

---

## 7. Vận hành: seed / dịch thuật

Script seed 1 lần, copy giá trị English sang mọi locale khác làm baseline cho translator sửa tiếp — **idempotent, chỉ ghi vào field đang rỗng** (không đè bản dịch đã có):

```ts
const isEmpty = (v: unknown) => v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

for (const locale of targetLocales) {
  const existing = await payload.findByID({ collection, id, locale, fallbackLocale: false, depth: 0 });
  if (!isEmpty(existing.title)) { skipped++; continue; } // đã dịch → bỏ qua
  await payload.update({ collection, id, locale, data: enData });
}
```

Điểm mấu chốt:
- `fallbackLocale: false` khi đọc để phát hiện đúng "trống thật" (không bị Payload tự fallback che mất).
- Trước khi ghi, **strip mọi `id` key trong nested array/group** — mỗi locale sở hữu row id riêng, ghi id của locale khác sẽ bị Payload reject.
- Field nào cần copy khai báo tường minh theo collection (không copy đại trà mọi field — tránh copy nhầm field không-localized hoặc field quan hệ).

Sau khi content team dịch trực tiếp trong Payload admin (đổi locale ở góc admin) — không cần deploy lại, chỉ cache revalidate qua tag.

---

## 8. Checklist khi thêm 1 trang / feature mới cần đa ngôn ngữ

- [ ] Field content mới cần dịch → `localized: true` trong Payload field, thêm vào seed script's per-collection field list nếu muốn baseline copy.
- [ ] UI microcopy mới → thêm key vào `translations` collection (dot-notation) + JSON seed file mọi locale (tối thiểu `en`).
- [ ] Data getter mới → cache key + tag PHẢI chứa locale; getter nhận `locale?: string`, có default fallback.
- [ ] Page/route mới có filter/search params → kiểm tra có literally đọc `searchParams` không — nếu có, page đó mất ISR, phải cache ở CDN layer riêng (không phải phần i18n nhưng hay đụng chung khi làm listing page đa ngôn ngữ).
- [ ] Route dùng conventional bare path (robots.txt, llms.txt...) → đặt logic thật dưới `[locale]`, route root chỉ redirect 308 về default locale.
- [ ] `generateMetadata` → set `alternates.languages` bằng `buildAlternates`.
- [ ] Sitemap → thêm entry getter theo locale nếu là collection mới.
- [ ] Middleware matcher → xác nhận path mới không bị exclude nhầm (hoặc ngược lại, path admin/api mới không bị match nhầm vào i18n).

---

## 9. Sai lầm thường gặp (tránh)

| Sai lầm | Hậu quả | Cách đúng |
|---|---|---|
| Cache key không có locale | Locale A đọc nhầm cache locale B | Luôn nhét `locale` vào cache key + tag |
| `where.slug` query không match default locale trước | Tour không tìm thấy ở locale không phải default | Match slug ở default locale → lấy id → load locale đích |
| Đè bản dịch đã có khi seed | Mất công dịch thủ công | Seed script check `isEmpty` trước khi ghi, `fallbackLocale:false` khi đọc |
| Copy nested array giữ nguyên `id` sang locale khác | Payload reject write | Strip toàn bộ `id` key trước khi ghi locale khác |
| Locale list định nghĩa 2 nơi (Payload config + routing config) rồi lệch | Locale tồn tại ở CMS nhưng 404 ở route, hoặc ngược lại | 1 file định nghĩa, nơi khác import (ít nhất đồng bộ thủ công + comment nhắc) |
| Quên fallback JSON khi DB chưa migrate | Trang trắng UI string khi seed chưa chạy | `getDbMessages` never throws, luôn có JSON layer dưới |
| Bare-path file route (robots.txt, sitemap) không tính đến locale prefix | 500 vì middleware skip dotted path, không route nào match | Route thật dưới `[locale]`, root path redirect 308 |

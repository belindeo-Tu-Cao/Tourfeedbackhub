import { locales, defaultLocale } from '@/i18n/routing';

function localizedPath(locale: string, path = '/'): string {
  const normalized = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

export function localizedUrl(baseUrl: string, locale: string, path = '/'): string {
  return `${baseUrl.replace(/\/$/, '')}${localizedPath(locale, path)}`;
}

export function buildAlternates(baseUrl: string, path = '/'): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = localizedUrl(baseUrl, locale, path);
  languages['x-default'] = localizedUrl(baseUrl, defaultLocale, path);
  return languages;
}

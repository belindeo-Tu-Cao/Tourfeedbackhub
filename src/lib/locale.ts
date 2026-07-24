import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'

export const DEFAULT_LOCALE = defaultLocale

/**
 * Coerce an arbitrary string (e.g. a route param) into a known `AppLocale`,
 * falling back to `DEFAULT_LOCALE` when the value isn't a supported locale.
 */
export function asLocale(value?: string | null): AppLocale {
  return (locales as readonly string[]).includes(value ?? '')
    ? (value as AppLocale)
    : defaultLocale
}

/** Alias of `asLocale`, kept for cache-key readability at call sites. */
export function localeKey(value?: string | null): AppLocale {
  return asLocale(value)
}

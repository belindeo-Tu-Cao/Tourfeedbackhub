import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'es', 'it', 'vi'] as const
export type AppLocale = (typeof locales)[number]
export const defaultLocale: AppLocale = 'en'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

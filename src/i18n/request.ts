import { getRequestConfig } from 'next-intl/server'
import type { AbstractIntlMessages } from 'use-intl'
import { routing, type AppLocale } from './routing'
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

function isAppLocale(value: string | undefined): value is AppLocale {
  return !!value && (routing.locales as readonly string[]).includes(value)
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale: AppLocale = isAppLocale(requested) ? requested : routing.defaultLocale

  const [enDefaults, localeDefaults, dbMessages] = await Promise.all([
    import('./messages/en/common.json').then((m) => m.default as Dict),
    locale === 'en'
      ? Promise.resolve({} as Dict)
      : import(`./messages/${locale}/common.json`).then((m) => m.default as Dict),
    getDbMessages(locale),
  ])

  return {
    locale,
    messages: deepMerge(deepMerge(enDefaults, localeDefaults), dbMessages) as AbstractIntlMessages,
  }
})

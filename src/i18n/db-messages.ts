import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getPayloadClient } from '@/lib/payload'
import type { AppLocale } from './routing'

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

async function fetchTranslations(locale: AppLocale): Promise<Record<string, unknown>> {
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

const getDbMessagesCached = cache((locale: AppLocale) =>
  unstable_cache(() => fetchTranslations(locale), ['cms', 'translations', locale], {
    tags: [TRANSLATIONS_TAG],
  })(),
)

export function getDbMessages(locale: AppLocale): Promise<Record<string, unknown>> {
  return getDbMessagesCached(locale)
}

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
  let created = 0
  for (const [key, value] of flatten(en as Record<string, unknown>)) {
    const existing = await payload.find({
      collection: 'translations',
      where: { key: { equals: key } },
      limit: 1,
    })
    if (existing.docs.length) continue
    await payload.create({
      collection: 'translations',
      locale: 'en',
      data: { key, group: key.split('.')[0], value },
    })
    created++
  }
  payload.logger.info(`[seed] translations seeded (${created} new)`)
}

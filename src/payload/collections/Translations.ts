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

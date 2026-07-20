import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Public read so <Image>/next-image can fetch /api/media/file/* anonymously.
    // Payload v3 defaults every operation to isLoggedIn when access is unset.
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'altText',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'mediaType',
      type: 'select',
      defaultValue: 'image',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Audio', value: 'audio' },
        { label: 'Document', value: 'document' },
        { label: 'Other', value: 'other' },
      ],
    },
  ],
}

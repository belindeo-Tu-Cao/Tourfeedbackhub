import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    // Guests read published only; logged-in users read all.
    read: ({ req: { user } }) => (user ? true : { status: { equals: 'published' } }),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'featuredImage', 'status', 'author', 'publishedAt'],
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'post',
      options: [
        { label: 'Post', value: 'post' },
        { label: 'Page', value: 'page' },
      ],
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Private', value: 'private' },
        { label: 'Trash', value: 'trash' },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'scheduledFor',
      type: 'date',
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'commentCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'allowComments',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'seo',
      type: 'json',
      localized: true,
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
    },
    {
      name: 'relatedStories',
      type: 'relationship',
      relationTo: 'stories',
      hasMany: true,
    },
    {
      name: 'relatedGuides',
      type: 'relationship',
      relationTo: 'guides',
      hasMany: true,
    },
    {
      name: 'relatedTourTypes',
      type: 'relationship',
      relationTo: 'tour-types',
      hasMany: true,
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'avatar', 'role', 'status'],
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'subscriber',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
        { label: 'Contributor', value: 'contributor' },
        { label: 'Subscriber', value: 'subscriber' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Banned', value: 'banned' },
      ],
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'socialLinks',
      type: 'json',
    },
    {
      name: 'permissions',
      type: 'array',
      fields: [
        {
          name: 'permission',
          type: 'text',
        },
      ],
    },
  ],
}

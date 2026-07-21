import type { CollectionConfig } from 'payload'

export const Stories: CollectionConfig = {
  slug: 'stories',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'readTimeMinutes',
      type: 'number',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'category',
      type: 'text',
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

export const Slides: CollectionConfig = {
  slug: 'slides',
  access: {
    // Guests read published only; logged-in users read all.
    read: ({ req: { user } }) => (user ? true : { status: { equals: 'published' } }),
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'locale',
      type: 'text',
      defaultValue: 'en',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'buttonText',
      type: 'text',
    },
    {
      name: 'buttonLink',
      type: 'text',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'overlayOpacity',
      type: 'number',
    },
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'startAt',
      type: 'date',
    },
    {
      name: 'endAt',
      type: 'date',
    },
  ],
}

export const NavigationMenus: CollectionConfig = {
  slug: 'navigation-menus',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'key',
      type: 'select',
      required: true,
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Footer', value: 'footer' },
      ],
    },
    {
      name: 'locale',
      type: 'text',
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
        },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'internal',
          options: [
            { label: 'Internal', value: 'internal' },
            { label: 'External', value: 'external' },
            { label: 'Hash', value: 'hash' },
          ],
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'parentId',
          type: 'text',
        },
        {
          name: 'icon',
          type: 'text',
        },
        {
          name: 'target',
          type: 'select',
          defaultValue: '_self',
          options: [
            { label: 'Self', value: '_self' },
            { label: 'Blank', value: '_blank' },
          ],
        },
        {
          name: 'visibleFor',
          type: 'array',
          fields: [
            {
              name: 'audience',
              type: 'select',
              options: [
                { label: 'Guest', value: 'guest' },
                { label: 'User', value: 'user' },
                { label: 'Admin', value: 'admin' },
              ],
            },
          ],
        },
        {
          name: 'badge',
          type: 'json',
        },
        {
          name: 'area',
          type: 'select',
          options: [
            { label: 'Links', value: 'links' },
            { label: 'Legal', value: 'legal' },
            { label: 'Social', value: 'social' },
            { label: 'Contact', value: 'contact' },
            { label: 'CTA', value: 'cta' },
          ],
        },
        {
          name: 'group',
          type: 'text',
        },
      ],
    },
  ],
}

export const Mail: CollectionConfig = {
  slug: 'mail',
  admin: {
    useAsTitle: 'subject',
  },
  fields: [
    {
      name: 'to',
      type: 'email',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
    },
    {
      name: 'html',
      type: 'textarea',
    },
    {
      name: 'text',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
    },
  ],
}

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'siteName',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
    },
    {
      name: 'logoLight',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logoDark',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'heroTitle',
      type: 'text',
    },
    {
      name: 'heroSubtitle',
      type: 'textarea',
    },
    {
      name: 'heroCtaLabel',
      type: 'text',
    },
    {
      name: 'heroMedia',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'aboutTitle',
      type: 'text',
    },
    {
      name: 'aboutDescription',
      type: 'textarea',
    },
    {
      name: 'aboutImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'missionStatement',
      type: 'textarea',
    },
    {
      name: 'values',
      type: 'array',
      fields: [
        {
          name: 'value',
          type: 'text',
        },
      ],
    },
    {
      name: 'contact',
      type: 'json',
    },
    {
      name: 'social',
      type: 'json',
    },
    {
      name: 'copyright',
      type: 'text',
    },
    {
      name: 'languages',
      type: 'array',
      fields: [
        {
          name: 'lang',
          type: 'text',
        },
      ],
    },
    {
      name: 'defaultLanguage',
      type: 'text',
      defaultValue: 'en',
    },
    {
      name: 'primaryColor',
      type: 'text',
    },
    {
      name: 'accentColor',
      type: 'text',
    },
  ],
}

export const ThemeSettings: CollectionConfig = {
  slug: 'theme-settings',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'primaryColor',
  },
  fields: [
    {
      name: 'primaryFont',
      type: 'text',
    },
    {
      name: 'secondaryFont',
      type: 'text',
    },
    {
      name: 'primaryColor',
      type: 'text',
    },
    {
      name: 'secondaryColor',
      type: 'text',
    },
    {
      name: 'accentColor',
      type: 'text',
    },
    {
      name: 'backgroundColor',
      type: 'text',
    },
    {
      name: 'textColor',
      type: 'text',
    },
    {
      name: 'linkColor',
      type: 'text',
    },
    {
      name: 'headerStyle',
      type: 'select',
      options: [
        { label: 'Minimal', value: 'minimal' },
        { label: 'Classic', value: 'classic' },
        { label: 'Modern', value: 'modern' },
      ],
    },
    {
      name: 'footerStyle',
      type: 'select',
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Detailed', value: 'detailed' },
      ],
    },
    {
      name: 'customCSS',
      type: 'textarea',
    },
    {
      name: 'customJS',
      type: 'textarea',
    },
  ],
}

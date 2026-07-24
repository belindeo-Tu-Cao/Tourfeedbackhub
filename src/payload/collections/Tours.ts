import type { CollectionConfig } from 'payload'

export const Guides: CollectionConfig = {
  slug: 'guides',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'photo', 'phone', 'email'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    // --- Tour-guide license card (Thẻ hướng dẫn viên du lịch) ---
    {
      name: 'cardNumber',
      label: 'Card Number (Số thẻ)',
      type: 'text',
    },
    {
      name: 'cardType',
      label: 'Card Type (Loại thẻ)',
      type: 'select',
      options: [
        { label: 'International (Quốc tế)', value: 'international' },
        { label: 'Domestic (Nội địa)', value: 'domestic' },
      ],
    },
    {
      name: 'cardIssuePlace',
      label: 'Place of Issue (Nơi cấp thẻ)',
      type: 'text',
    },
    {
      name: 'cardIssueDate',
      label: 'Issue Date (Ngày cấp)',
      type: 'date',
    },
    {
      name: 'cardExpiryDate',
      label: 'Expiry Date (Ngày hết hạn)',
      type: 'date',
    },
    {
      name: 'experienceYears',
      label: 'Experience at Issue (Kinh nghiệm đến ngày cấp thẻ, năm)',
      type: 'number',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'slogan',
      type: 'text',
      localized: true,
    },
    {
      name: 'guideFeeUsd',
      label: 'Guide Fee (USD/day)',
      type: 'number',
      min: 0,
    },
    {
      name: 'showOnFrontend',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'socials',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'tiktok', type: 'text' },
        { name: 'whatsapp', type: 'text' },
        { name: 'zalo', type: 'text' },
        { name: 'viber', type: 'text' },
        { name: 'linkedin', type: 'text' },
      ],
    },
    {
      name: 'spokenLanguages',
      type: 'array',
      fields: [
        { name: 'language', type: 'relationship', relationTo: 'languages', required: true },
        {
          name: 'level',
          type: 'select',
          options: [
            { label: 'Basic', value: 'basic' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Fluent', value: 'fluent' },
            { label: 'Native', value: 'native' },
          ],
        },
        { name: 'certificate', type: 'text' },
      ],
    },
    {
      name: 'provinces',
      type: 'relationship',
      relationTo: 'provinces',
      hasMany: true,
    },
    {
      name: 'nationalities',
      type: 'relationship',
      relationTo: 'nationalities',
      hasMany: true,
    },
    {
      name: 'tourTypes',
      type: 'relationship',
      relationTo: 'tour-types',
      hasMany: true,
    },
  ],
}

export const Tours: CollectionConfig = {
  slug: 'tours',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
    },
    {
      name: 'company',
      label: 'Company',
      type: 'text',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'itinerary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'startDate',
      type: 'date',
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'clientCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'clientCountry',
      type: 'text',
    },
    {
      name: 'clientCity',
      type: 'text',
    },
    {
      name: 'guides',
      type: 'relationship',
      relationTo: 'guides',
      hasMany: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'finished',
      options: [
        { label: 'Finished', value: 'finished' },
        { label: 'For Sale', value: 'for_sale' },
      ],
    },
    {
      name: 'showFeedbackForm',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'photos',
      type: 'array',
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'videos',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'provinces',
      type: 'relationship',
      relationTo: 'provinces',
      hasMany: true,
    },
    {
      name: 'tourTypes',
      type: 'relationship',
      relationTo: 'tour-types',
      hasMany: true,
    },
    {
      name: 'clientNationalities',
      type: 'relationship',
      relationTo: 'nationalities',
      hasMany: true,
    },
    {
      name: 'guideLanguages',
      type: 'relationship',
      relationTo: 'languages',
      hasMany: true,
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
      type: 'collapsible',
      label: 'Sale details (for_sale tours)',
      admin: {
        condition: (data) => data?.status === 'for_sale',
      },
      fields: [
        {
          name: 'price',
          type: 'number',
          min: 0,
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'VND',
          options: [
            { label: 'VND', value: 'VND' },
            { label: 'USD', value: 'USD' },
          ],
        },
        {
          name: 'priceUnit',
          type: 'select',
          defaultValue: 'per_person',
          options: [
            { label: 'Per person', value: 'per_person' },
            { label: 'Per group', value: 'per_group' },
          ],
        },
        {
          name: 'durationDays',
          label: 'Duration (days)',
          type: 'number',
          min: 1,
        },
        {
          name: 'groupSizeMin',
          type: 'number',
          min: 1,
        },
        {
          name: 'groupSizeMax',
          type: 'number',
          min: 1,
        },
        {
          name: 'departureSchedule',
          label: 'Departure schedule (e.g. "Daily", "Every Mon/Thu")',
          type: 'text',
        },
        {
          name: 'highlights',
          type: 'array',
          fields: [{ name: 'item', type: 'text', required: true, localized: true }],
        },
        {
          name: 'included',
          type: 'array',
          fields: [{ name: 'item', type: 'text', required: true, localized: true }],
        },
        {
          name: 'excluded',
          type: 'array',
          fields: [{ name: 'item', type: 'text', required: true, localized: true }],
        },
      ],
    },
  ],
}

export const TourComments: CollectionConfig = {
  slug: 'tour-comments',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'authorName',
  },
  fields: [
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
      required: true,
    },
    {
      name: 'authorName',
      type: 'text',
    },
    {
      name: 'rating',
      type: 'number',
    },
    {
      name: 'message',
      type: 'textarea',
    },
  ],
}

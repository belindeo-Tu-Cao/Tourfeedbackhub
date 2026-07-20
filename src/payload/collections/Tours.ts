import type { CollectionConfig } from 'payload'

export const Guides: CollectionConfig = {
  slug: 'guides',
  admin: {
    useAsTitle: 'name',
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
      name: 'languages',
      type: 'relationship',
      relationTo: 'languages',
      hasMany: true,
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'itinerary',
      type: 'textarea',
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
      name: 'guide',
      type: 'relationship',
      relationTo: 'guides',
    },
    {
      name: 'guideName',
      type: 'text',
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

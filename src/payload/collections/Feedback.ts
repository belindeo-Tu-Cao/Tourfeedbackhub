import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'photo', 'rating', 'status', 'submittedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'language',
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
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'source',
      type: 'text',
    },
    {
      name: 'externalUrl',
      type: 'text',
    },
    {
      name: 'reviewTitle',
      type: 'text',
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'feedbackSummary',
      type: 'textarea',
    },
    {
      name: 'guide',
      type: 'relationship',
      relationTo: 'guides',
    },
    {
      name: 'tourRef',
      type: 'relationship',
      relationTo: 'tours',
    },
    {
      name: 'approvedAt',
      type: 'date',
    },
    {
      name: 'review',
      type: 'relationship',
      relationTo: 'reviews',
    },
    {
      name: 'rejectedAt',
      type: 'date',
    },
    {
      name: 'rejectedBy',
      type: 'text',
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
    },
    {
      name: 'submittedAt',
      type: 'date',
    },
  ],
}

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: {
    // Guests read approved only; logged-in users read all.
    read: ({ req: { user } }) => (user ? true : { status: { equals: 'approved' } }),
  },
  admin: {
    useAsTitle: 'authorDisplay',
  },
  fields: [
    {
      name: 'authorDisplay',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'language',
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
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
    },
    {
      name: 'tourName',
      type: 'text',
    },
    {
      name: 'photoUrls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'reviewType',
      type: 'text',
    },
    {
      name: 'approvedAt',
      type: 'date',
    },
    {
      name: 'feedback',
      type: 'relationship',
      relationTo: 'feedback',
    },
  ],
}

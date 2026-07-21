'use server';

import { z } from 'zod';
import { getPayloadClient } from '@/lib/payload';

const feedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  country: z.string().min(1, 'Please select your country.'),
  language: z.string().min(1, 'Please select your language.'),
  rating: z.number().min(1, 'Please provide a rating.').max(5),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters.')
    .max(1000, 'Message must be 1000 characters or less.'),
  tourId: z.string().optional(),
});

export async function submitFeedback(formData: FormData) {
  try {
    const validatedFields = feedbackSchema.safeParse({
      name: formData.get('name'),
      country: formData.get('country'),
      language: formData.get('language'),
      rating: Number(formData.get('rating')),
      message: formData.get('message'),
      tourId: formData.get('tourId') || undefined,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Validation failed.',
      };
    }

    const { tourId, ...data } = validatedFields.data;
    const tourIdNumber = tourId ? Number(tourId) : undefined;
    if (tourId && !Number.isInteger(tourIdNumber)) {
      return { message: 'The selected tour is invalid.' };
    }
    const payload = await getPayloadClient();
    await payload.create({
      collection: 'feedback',
      data: {
        ...data,
        ...(tourIdNumber !== undefined ? { tour: tourIdNumber } : {}),
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
    });

    return {
      message: 'Feedback submitted successfully.',
    };
  } catch (e) {
    console.error('submitFeedback failed', e);
    return {
      message: 'An unexpected error occurred.',
    };
  }
}

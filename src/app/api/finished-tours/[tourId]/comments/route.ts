import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPayloadClient } from '@/lib/payload';

const commentSchema = z.object({
  authorName: z.string().min(1, 'Name is required'),
  rating: z.number().min(1).max(5),
  message: z.string().min(1, 'Message is required'),
});

export async function POST(request: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const { tourId } = await params;
  const tourIdNumber = Number(tourId);

  if (!Number.isInteger(tourIdNumber)) {
    return NextResponse.json({ error: 'Missing tour id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((issue) => issue.message).join(', ') },
      { status: 400 }
    );
  }

  const { authorName, rating, message } = parsed.data;

  try {
    const payload = await getPayloadClient();

    let tourName = '';
    try {
      const tour = await payload.findByID({ collection: 'tours', id: tourIdNumber, depth: 0 });
      tourName = (tour as Record<string, any>)?.name ?? '';
    } catch {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    await payload.create({
      collection: 'reviews',
      data: {
        authorDisplay: authorName,
        country: '',
        language: 'en',
        rating,
        message,
        tour: tourIdNumber,
        tourName,
        status: 'pending',
        reviewType: 'finishedTour',
      },
    });

    return NextResponse.json({ success: true, requiresApproval: true });
  } catch (error) {
    console.error('Failed to submit finished tour comment', error);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}

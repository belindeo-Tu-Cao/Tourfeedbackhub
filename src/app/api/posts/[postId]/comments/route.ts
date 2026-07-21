import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPayloadClient } from '@/lib/payload';

const commentSchema = z.object({
  authorName: z.string().min(1, 'Name is required'),
  authorEmail: z.string().email('A valid email is required'),
  content: z.string().min(1, 'Comment is required'),
});

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const postIdNumber = Number(postId);

  if (!Number.isInteger(postIdNumber)) {
    return NextResponse.json({ error: 'Missing post id' }, { status: 400 });
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

  const { authorName, authorEmail, content } = parsed.data;

  try {
    const payload = await getPayloadClient();

    try {
      await payload.findByID({ collection: 'posts', id: postIdNumber, depth: 0 });
    } catch {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await payload.create({
      collection: 'comments',
      data: {
        post: postIdNumber,
        authorName,
        authorEmail,
        content,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, requiresApproval: true });
  } catch (error) {
    console.error('Failed to submit post comment', error);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}

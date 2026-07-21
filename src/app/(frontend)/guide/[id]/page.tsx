import { notFound } from 'next/navigation';
import { getGuideProfile, getGuideTours, getGuideReviews } from '@/lib/content-service';
import GuideProfile from '@/components/guide-profile';
import type { Metadata } from 'next';

interface GuidePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { id } = await params;
  const guide = await getGuideProfile(id);

  if (!guide) {
    return { title: 'Guide Not Found' };
  }

  return {
    title: `${guide.name} - Tour Guide Profile`,
    description: guide.bio || `Profile of tour guide ${guide.name}`,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { id } = await params;
  const [guide, tours, reviews] = await Promise.all([
    getGuideProfile(id),
    getGuideTours(id),
    getGuideReviews(id),
  ]);

  if (!guide) {
    notFound();
  }

  return <GuideProfile guide={guide} tours={tours} reviews={reviews} />;
}

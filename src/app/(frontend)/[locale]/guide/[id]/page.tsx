import { notFound } from 'next/navigation';
import { getGuideProfile, getGuideTours, getGuideReviews, getGuideRelatedPosts } from '@/lib/content-service';
import GuideProfile from '@/components/guide-profile';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

interface GuidePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const guide = await getGuideProfile(id, locale);

  if (!guide) {
    return { title: 'Guide Not Found' };
  }

  return {
    title: `${guide.name} - Tour Guide Profile`,
    description: guide.bio || `Profile of tour guide ${guide.name}`,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [guide, tours, reviews, relatedPosts] = await Promise.all([
    getGuideProfile(id, locale),
    getGuideTours(id, locale),
    getGuideReviews(id, locale),
    getGuideRelatedPosts(id, locale),
  ]);

  if (!guide) {
    notFound();
  }

  return <GuideProfile guide={guide} tours={tours} reviews={reviews} relatedPosts={relatedPosts} />;
}

import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbStructuredData } from '@/components/structured-data';
import { RelatedContentSection } from '@/components/related-content-section';
import {
  getTourTypeBySlug,
  getToursForTourType,
  getGuidesForTourType,
  getRelatedPostsByField,
  getStoriesByField,
} from '@/lib/content-service';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/locale-path';

interface TourTypePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: TourTypePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tourType = await getTourTypeBySlug(slug, locale);
  if (!tourType) return { title: 'Tour Style Not Found' };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tourfeedbackhub.web.app';
  return {
    title: `${tourType.title} — Tour Styles`,
    description: tourType.description,
    alternates: {
      languages: buildAlternates(siteUrl, `/tour-types/${slug}`),
    },
  };
}

export default async function TourTypePage({ params }: TourTypePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tourType = await getTourTypeBySlug(slug, locale);

  if (!tourType) {
    notFound();
  }

  const [tours, guides, posts, stories] = await Promise.all([
    getToursForTourType(tourType.id, locale),
    getGuidesForTourType(tourType.id, locale),
    getRelatedPostsByField('relatedTourTypes', tourType.id, locale),
    getStoriesByField('relatedTourTypes', tourType.id, locale),
  ]);

  return (
    <div className="bg-background py-16 md:py-24">
      <BreadcrumbStructuredData items={[{ name: 'Tour Styles', url: '/tour-types' }, { name: tourType.title }]} />
      <div className="container mx-auto px-4">
        <Link href="/tour-types" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          All tour styles
        </Link>

        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="text-lg">{tourType.icon ?? '✨'}</Badge>
          <h1 className="mt-4 text-4xl md:text-5xl font-headline font-bold">{tourType.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{tourType.description}</p>
        </div>

        <div className="mt-12 mx-auto max-w-6xl">
          <RelatedContentSection title="Tours in this style" items={tours} />
          <RelatedContentSection title="Guides who specialize in this" items={guides} />
          <RelatedContentSection title="Stories" items={stories} />
          <RelatedContentSection title="Blog posts" items={posts} />
        </div>
      </div>
    </div>
  );
}

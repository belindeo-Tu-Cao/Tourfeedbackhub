import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/breadcrumb';
import { BreadcrumbStructuredData } from '@/components/structured-data';
import { RelatedContentSection } from '@/components/related-content-section';
import {
  getStoryBySlug,
  getRelatedTours,
  getRelatedPostsByField,
} from '@/lib/content-service';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/locale-path';

interface StoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const story = await getStoryBySlug(slug, locale);
  if (!story) return { title: 'Story Not Found' };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tourfeedbackhub.web.app';
  return {
    title: `${story.title} — Stories`,
    description: story.excerpt,
    alternates: {
      languages: buildAlternates(siteUrl, `/stories/${slug}`),
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const story = await getStoryBySlug(slug, locale);

  if (!story) {
    notFound();
  }

  const [relatedTours, relatedPosts] = await Promise.all([
    getRelatedTours('relatedStories', story.id, locale),
    getRelatedPostsByField('relatedStories', story.id, locale),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbStructuredData items={[{ name: 'Stories', url: '/stories' }, { name: story.title }]} />

      <section className="relative w-full h-[35vh] md:h-[45vh] bg-muted">
        {story.coverImageUrl ? (
          <Image src={story.coverImageUrl} alt={story.title} fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-4xl mx-auto">
              <Link href="/stories" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Stories
              </Link>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-white mb-4">{story.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time>{format(story.publishedAt, 'MMMM d, yyyy')}</time>
                </div>
                {story.readTimeMinutes ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{story.readTimeMinutes} min read</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {story.excerpt ? (
              <p className="mb-8 text-lg text-muted-foreground italic leading-relaxed">{story.excerpt}</p>
            ) : null}
            {story.content ? (
              <article className="prose prose-lg max-w-none whitespace-pre-line">{story.content}</article>
            ) : null}

            {story.tags && story.tags.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            ) : null}

            <RelatedContentSection title="Related guides" items={story.relatedGuides} />
            <RelatedContentSection title="Related tour styles" items={story.relatedTourTypes} />
            <RelatedContentSection title="Related tours" items={relatedTours} />
            <RelatedContentSection title="Related posts" items={relatedPosts} />
          </div>
        </div>
      </section>
    </div>
  );
}

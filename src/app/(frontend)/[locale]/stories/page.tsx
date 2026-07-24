import { getPublicContent } from '@/lib/content-service';
import StoriesExplorer from '@/components/stories-explorer';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function StoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('stories');
  const { stories } = await getPublicContent(locale);
  const serialisedStories = stories.map((story) => ({
    id: story.id,
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    coverImageUrl: story.coverImageUrl,
    publishedAt: story.publishedAt.toISOString(),
    readTimeMinutes: story.readTimeMinutes ?? null,
    tags: story.tags ?? [],
    category: story.category ?? null,
  }));

  return (
    <div className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center rounded-full border border-border/60 bg-secondary/30 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t('title')}
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-headline font-bold">{t('title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="mt-12">
          <StoriesExplorer stories={serialisedStories} />
        </div>
      </div>
    </div>
  );
}

import { getBlogPosts, getBlogCategories } from '@/lib/blog';
import { Breadcrumb } from '@/components/breadcrumb';
import { WebSiteStructuredData } from '@/components/structured-data';
import { BlogListClient } from '@/components/blog-list-client';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('blog');
  const [posts, categories] = await Promise.all([getBlogPosts(locale), getBlogCategories()]);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

  return (
    <div className="min-h-screen bg-background">
      <WebSiteStructuredData
        name={process.env.NEXT_PUBLIC_SITE_NAME || 'Tour Insights Hub'}
        url={baseUrl}
        description={t('description')}
      />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={[{ label: t('title') }]} className="mb-6" />

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('description')}
          </p>
        </div>

        <BlogListClient posts={posts} categories={categories} />
      </div>
    </div>
  );
}

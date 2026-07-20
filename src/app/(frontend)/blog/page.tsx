import { getBlogPosts, getBlogCategories } from '@/lib/blog';
import { Breadcrumb } from '@/components/breadcrumb';
import { WebSiteStructuredData } from '@/components/structured-data';
import { BlogListClient } from '@/components/blog-list-client';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getBlogPosts(), getBlogCategories()]);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

  return (
    <div className="min-h-screen bg-background">
      <WebSiteStructuredData
        name={process.env.NEXT_PUBLIC_SITE_NAME || 'Tour Insights Hub'}
        url={baseUrl}
        description="Discover travel stories, tour guides, and insights from travelers around the world"
      />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={[{ label: 'Blog' }]} className="mb-6" />

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Explore travel stories, guides, and insights from our community of travelers
          </p>
        </div>

        <BlogListClient posts={posts} categories={categories} />
      </div>
    </div>
  );
}

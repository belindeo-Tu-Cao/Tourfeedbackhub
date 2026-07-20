import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { BreadcrumbStructuredData } from '@/components/structured-data';
import { getBlogPost } from '@/lib/blog';
import { mediaUrl } from '@/lib/payload';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const p = post as Record<string, any>;
  const title: string = p.title ?? 'Untitled post';
  const excerpt: string = p.excerpt ?? '';
  const authorName: string =
    typeof p.author === 'object' && p.author
      ? p.author.displayName ?? p.author.email ?? 'Unknown'
      : 'Unknown';
  const publishedAt = p.publishedAt ? new Date(p.publishedAt) : null;
  const createdAt = p.createdAt ? new Date(p.createdAt) : new Date();
  const viewCount: number = typeof p.viewCount === 'number' ? p.viewCount : 0;
  const featuredImageUrl = mediaUrl(p.featuredImage);
  const featuredImageAlt =
    typeof p.featuredImage === 'object' && p.featuredImage ? p.featuredImage.alt ?? title : title;
  const categories: Array<{ id: string | number; name?: string }> = Array.isArray(p.categories)
    ? p.categories.filter((c: unknown): c is { id: string | number; name?: string } => Boolean(c) && typeof c === 'object')
    : [];
  const tags: Array<{ id: string | number; name?: string }> = Array.isArray(p.tags)
    ? p.tags.filter((t: unknown): t is { id: string | number; name?: string } => Boolean(t) && typeof t === 'object')
    : [];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbStructuredData items={[{ name: 'Blog', url: '/blog' }, { name: title }]} />

      <article className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumb items={[{ label: 'Blog', href: '/blog' }, { label: title }]} className="mb-6" />

        <header className="mb-8">
          {categories.length > 0 && (
            <div className="flex gap-2 mb-4">
              {categories.map((cat) => (
                <Badge key={String(cat.id)} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{title}</h1>

          {excerpt && <p className="text-xl text-muted-foreground mb-6">{excerpt}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={createdAt.toISOString()}>
                {format(publishedAt ?? createdAt, 'MMMM d, yyyy')}
              </time>
            </div>
            {viewCount > 0 && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{viewCount} views</span>
              </div>
            )}
          </div>
        </header>

        {featuredImageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featuredImageUrl} alt={featuredImageAlt} className="w-full h-auto object-cover" />
          </div>
        )}

        {p.content && (
          <div className="prose prose-lg max-w-none">
            <RichText data={p.content} />
          </div>
        )}

        {tags.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">TAGS</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={String(tag.id)} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

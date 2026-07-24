import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Eye, Clock, Share2, ArrowLeft, BookOpen, Tag } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { BreadcrumbStructuredData } from '@/components/structured-data';
import { getBlogPost } from '@/lib/blog';
import { mediaUrl } from '@/lib/payload';
import {
  getRelatedPostsFor,
  getRelatedTours,
  getPostComments,
  toRelatedItemSummaries,
} from '@/lib/content-service';
import { RelatedContentSection } from '@/components/related-content-section';
import { PostCommentForm } from '@/components/blog/post-comment-form';
import { setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getBlogPost(slug, locale);

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

  // Estimate reading time (rough: 200 words per minute)
  const contentText = typeof p.content === 'object' ? JSON.stringify(p.content) : '';
  const wordCount = contentText.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const postId = String(p.id);
  const categoryIds = categories.map((c) => String(c.id));
  const explicitRelatedPosts = toRelatedItemSummaries(p.relatedPosts, 'post');
  const relatedStories = toRelatedItemSummaries(p.relatedStories, 'story');
  const relatedGuides = toRelatedItemSummaries(p.relatedGuides, 'guide');

  const [relatedPosts, relatedTours, comments] = await Promise.all([
    getRelatedPostsFor(postId, categoryIds, explicitRelatedPosts, locale),
    getRelatedTours('relatedPosts', postId, locale),
    getPostComments(postId),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbStructuredData items={[{ name: 'Blog', url: '/blog' }, { name: title }]} />

      {/* Hero Section with Featured Image */}
      <section className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] bg-muted">
        {featuredImageUrl ? (
          <Image
            src={featuredImageUrl}
            alt={featuredImageAlt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <BookOpen className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8 md:pb-12">
            <div className="max-w-4xl mx-auto">
              {/* Back button */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((cat) => (
                    <Badge key={String(cat.id)} className="bg-primary text-primary-foreground">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-white mb-4 leading-tight">
                {title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
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
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
                {viewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{viewCount} views</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Excerpt */}
            {excerpt && (
              <div className="mb-8 p-6 rounded-2xl bg-muted/50 border border-border/60">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">
                  "{excerpt}"
                </p>
              </div>
            )}

            {/* Content */}
            {p.content && (
              <article className="prose prose-lg prose-headlines:font-headline prose-a:text-primary prose-img:rounded-xl prose-img:shadow-lg max-w-none">
                <RichText data={p.content} />
              </article>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={String(tag.id)} variant="secondary" className="text-sm">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="mt-12 p-6 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Share this article</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || 'https://tourfeedbackhub.com')}/blog/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Facebook
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || 'https://tourfeedbackhub.com')}/blog/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Twitter
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || 'https://tourfeedbackhub.com')}/blog/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Author Card */}
            <div className="mt-12 p-6 rounded-2xl border border-border/60 bg-background">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Written by</p>
                  <h4 className="text-lg font-headline font-semibold">{authorName}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tour guide and travel enthusiast sharing insights about Vietnam's hidden gems and historical treasures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-headline font-bold mb-6">
              Comments {comments.length > 0 ? `(${comments.length})` : ''}
            </h2>
            <div className="mb-8 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border bg-card/50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">{comment.authorName}</span>
                    <span className="text-muted-foreground">{comment.createdAt.toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts.</p>
              )}
            </div>
            <PostCommentForm postId={postId} />
          </div>
        </div>
      </section>

      {/* Related content */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <RelatedContentSection title="More travel stories" items={relatedPosts} />
            <RelatedContentSection title="Related stories" items={relatedStories} />
            <RelatedContentSection title="Related guides" items={relatedGuides} />
            <RelatedContentSection title="Related tours" items={relatedTours} />
          </div>
        </div>
      </section>
    </div>
  );
}

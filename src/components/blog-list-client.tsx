'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { BlogListItem, BlogCategory } from '@/lib/blog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Search, Calendar, User } from 'lucide-react';

const POSTS_PER_PAGE = 12;

export function BlogListClient({
  posts,
  categories,
}: {
  posts: BlogListItem[];
  categories: BlogCategory[];
}) {
  const t = useTranslations('blog');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.excerpt?.toLowerCase().includes(q) ||
          post.authorName?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter((post) => post.categoryIds.includes(selectedCategory));
    }
    return filtered;
  }, [posts, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const featuredPost = filteredPosts[0];
  const trendingPosts = useMemo(
    () =>
      filteredPosts
        .slice(1)
        .slice()
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 3),
    [filteredPosts]
  );

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={tCommon('search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCategory(null);
                setCurrentPage(1);
              }}
            >
              {t('title')}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
              >
                {category.name}
                {category.count > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}
      </div>

      {paginatedPosts.length > 0 ? (
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
                    {post.featuredImageUrl && (
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.featuredImageUrl}
                          alt={post.featuredImageAlt}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      {post.categoryNames.length > 0 && (
                        <div className="mb-2 flex gap-2">
                          {post.categoryNames.slice(0, 2).map((name) => (
                            <Badge key={name} variant="secondary" className="text-xs">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <h2 className="text-xl font-semibold leading-tight line-clamp-2 transition-colors hover:text-primary">
                        {post.title}
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt || post.content.slice(0, 140)}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{post.authorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <time dateTime={post.createdAt.toISOString()}>
                          {format(post.publishedAt || post.createdAt, 'MMM d, yyyy')}
                        </time>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {tCommon('previous')}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {tCommon('next')}
                </Button>
              </div>
            )}
          </div>

          <aside className="space-y-8">
            {featuredPost && (
              <div className="rounded-xl border border-border/60 bg-background/70 p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('title')}
                </h3>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="mt-2 block text-lg font-headline leading-snug hover:text-primary"
                >
                  {featuredPost.title}
                </Link>
                {featuredPost.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-4">
                    {featuredPost.excerpt}
                  </p>
                )}
              </div>
            )}

            {trendingPosts.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-background/70 p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('title')}
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {trendingPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block font-medium leading-snug hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('noPosts')}</h3>
          <p className="text-muted-foreground max-w-md">
            {searchQuery || selectedCategory
              ? t('noPosts')
              : t('noPosts')}
          </p>
          {(searchQuery || selectedCategory) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setCurrentPage(1);
              }}
            >
              {tCommon('close')}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

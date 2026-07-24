'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClientStory {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  publishedAt: string;
  readTimeMinutes?: number | null;
  tags?: string[];
  category?: string | null;
}

interface StoriesExplorerProps {
  stories: ClientStory[];
}

const timeframeOptions = [
  { value: 'all', labelKey: 'allTime' },
  { value: '30', labelKey: 'last30Days' },
  { value: '90', labelKey: 'last3Months' },
  { value: '365', labelKey: 'lastYear' },
];

const lengthOptions = [
  { value: 'all', labelKey: 'anyLength' },
  { value: 'short', labelKey: 'short' },
  { value: 'medium', labelKey: 'medium' },
  { value: 'long', labelKey: 'long' },
];

function matchesTimeframe(publishedAt: Date, filter: string) {
  if (filter === 'all') return true;
  const days = Number(filter);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return publishedAt >= cutoff;
}

function matchesLength(readTime: number | null | undefined, filter: string) {
  if (filter === 'all') return true;
  if (!readTime) return filter === 'short';
  if (filter === 'short') return readTime < 5;
  if (filter === 'medium') return readTime >= 5 && readTime <= 9;
  if (filter === 'long') return readTime >= 10;
  return true;
}

export default function StoriesExplorer({ stories }: StoriesExplorerProps) {
  const t = useTranslations('stories');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [selectedLength, setSelectedLength] = useState<string>('all');

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    stories.forEach((story) => {
      story.tags?.forEach((tag) => tags.add(tag));
      if (story.category) {
        tags.add(story.category);
      }
    });
    return Array.from(tags).sort();
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const search = searchQuery.trim().toLowerCase();
      if (
        search &&
        !story.title.toLowerCase().includes(search) &&
        !story.excerpt.toLowerCase().includes(search)
      ) {
        return false;
      }

      const publishedAt = new Date(story.publishedAt);
      if (!matchesTimeframe(publishedAt, selectedTimeframe)) {
        return false;
      }

      const readTime = typeof story.readTimeMinutes === 'number' ? story.readTimeMinutes : null;
      if (!matchesLength(readTime, selectedLength)) {
        return false;
      }

      if (selectedTag !== 'all') {
        const tags = new Set<string>([
          ...(story.tags ?? []),
          ...(story.category ? [story.category] : []),
        ]);
        if (!tags.has(selectedTag)) {
          return false;
        }
      }

      return true;
    });
  }, [stories, searchQuery, selectedTimeframe, selectedLength, selectedTag]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTag('all');
    setSelectedTimeframe('all');
    setSelectedLength('all');
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('searchStories')}
            </label>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('tag')}
            </label>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue placeholder={t('allTags')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTags')}</SelectItem>
                {tagOptions.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('timeframe')}
            </label>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder={t('allTime')} />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('readTime')}
            </label>
            <Select value={selectedLength} onValueChange={setSelectedLength}>
              <SelectTrigger>
                <SelectValue placeholder={t('anyLength')} />
              </SelectTrigger>
              <SelectContent>
                {lengthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(searchQuery || selectedTag !== 'all' || selectedTimeframe !== 'all' || selectedLength !== 'all') && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              {tCommon('close')}
            </Button>
          </div>
        )}
      </div>

      {filteredStories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-background/70 p-12 text-center text-muted-foreground">
          {t('noStories')}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => {
            const publishedAt = new Date(story.publishedAt);
            const formattedDate = format(publishedAt, 'MMM d, yyyy');
            const readTime = story.readTimeMinutes ? `${story.readTimeMinutes} ${t('readTime')}` : t('title');
            const tags = story.tags ?? (story.category ? [story.category] : []);
            return (
              <Card key={story.id} className="flex h-full flex-col overflow-hidden border-border/60 bg-background/80 shadow-md">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    {story.coverImageUrl ? (
                      <Image
                        src={story.coverImageUrl}
                        alt={story.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-secondary-foreground/70">
                        {t('title')}
                      </div>
                    )}
                    <Badge className="absolute left-4 top-4 bg-background/90 text-xs">{readTime}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                    <span>{formattedDate}</span>
                    {tags.length > 0 ? <span>{tags[0]}</span> : null}
                  </div>
                  <CardTitle className="text-xl font-headline leading-tight">{story.title}</CardTitle>
                  <p className="text-sm leading-relaxed text-muted-foreground">{story.excerpt}</p>
                  {tags.length > 1 ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(1).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/stories/${story.slug}`}>Read the story</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

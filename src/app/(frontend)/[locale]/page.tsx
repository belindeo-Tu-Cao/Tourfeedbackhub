import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { format } from 'date-fns';
import { ArrowRight, Star, Compass, ChevronRight, Map as MapIcon, Sparkles, Users, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TourCard from '@/components/tour-card';
import { getPublicContent } from '@/lib/content-service';
import HeroCarousel from '@/components/hero-carousel';
import ReviewCarousel from '@/components/review-carousel';
import HomeFeedbackForm from '@/components/home-feedback-form';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');

  const { siteSettings, tours, reviews, tourTypes, stories, slides, posts } = await getPublicContent(locale);
  const finishedTours = tours.filter((tour) => tour.status === 'finished');
  const sortedDiaries = [...finishedTours].sort(
    (a, b) => b.startDate.getTime() - a.startDate.getTime()
  );
  const recentDiaries = sortedDiaries.slice(0, 3);
  const approvedReviews = reviews.filter((review) => review.status === 'approved');
  // `slides` are already scoped to the current locale by getPublicContent, so no
  // client-side locale filtering is needed.
  const heroSlides = slides;
  const primarySlide = heroSlides[0];
  const heroImage = primarySlide?.imageUrl ?? siteSettings.heroMediaUrl;
  const sortedStories = [...stories].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );
  const [featuredStory, ...remainingStories] = sortedStories;
  const recentStories = (remainingStories.length ? remainingStories : sortedStories).slice(0, 3);
  const recentPosts = posts
    .filter((post) => post.status === 'published' && post.type === 'post')
    .slice(0, 3);

  const aboutImage =
    siteSettings.heroMediaUrl ||
    primarySlide?.imageUrl ||
    recentDiaries[0]?.photoUrls?.[0] ||
    null;

  const ratingTotals = new Map<string, { total: number; count: number }>();
  approvedReviews.forEach((review) => {
    if (!review.tourId) return;
    const current = ratingTotals.get(review.tourId) ?? { total: 0, count: 0 };
    ratingTotals.set(review.tourId, {
      total: current.total + review.rating,
      count: current.count + 1,
    });
  });

  const getTourRatingSummary = (tourId: string) => {
    const entry = ratingTotals.get(tourId);
    if (!entry || entry.count === 0) {
      return null;
    }
    return {
      average: entry.total / entry.count,
      count: entry.count,
    };
  };

  const overallAverageRating = approvedReviews.length
    ? approvedReviews.reduce((acc, review) => acc + review.rating, 0) / approvedReviews.length
    : 0;
  const totalReviews = approvedReviews.length;

  const normaliseValueIcon = (value: string) => {
    const lower = value.toLowerCase();
    if (lower.includes('authentic')) return Compass;
    if (lower.includes('tailor') || lower.includes('personal')) return Users;
    if (lower.includes('local') || lower.includes('insight')) return MapIcon;
    if (lower.includes('sustain') || lower.includes('global')) return Globe2;
    return Sparkles;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HeroCarousel slides={heroSlides} />

      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="space-y-6">
              <span className="inline-flex w-fit items-center rounded-full border border-border/60 bg-card/50 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t('heroBadge')}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold leading-tight">
                {siteSettings.aboutTitle}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {siteSettings.aboutDescription}
              </p>
              {siteSettings.values && siteSettings.values.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {siteSettings.values.map((value) => {
                    const ValueIcon = normaliseValueIcon(value);
                    return (
                      <div
                        key={value}
                        className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm"
                      >
                        <ValueIcon className="mt-1 h-5 w-5 text-accent" />
                        <p className="text-sm leading-relaxed text-muted-foreground">{value}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href="/about">{t('discoverStory')}</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/tour-types">{t('exploreStyles')}</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[420px] w-full overflow-hidden rounded-3xl shadow-2xl">
                {aboutImage ? (
                  <Image
                    src={aboutImage}
                    alt="Travel moments in Vietnam"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/40 via-secondary/40 to-accent/40">
                    <span className="text-lg font-semibold text-primary-foreground/80">
                      {t('ourGuides')}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
              </div>
              {featuredStory && (
                <Card className="absolute -bottom-10 left-6 right-6 border border-border/60 bg-background/95 shadow-xl">
                  <CardHeader className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('latestDiaryHighlight')}</p>
                    <CardTitle className="text-lg font-headline leading-snug">{featuredStory.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{featuredStory.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{format(featuredStory.publishedAt, 'MMM d, yyyy')}</span>
                    <Button asChild variant="ghost" className="px-0">
                      <Link href="/stories">{t('readDiary')}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center">{t('tourStylesTitle')}</h2>
          <p className="mt-4 text-center max-w-2xl mx-auto text-muted-foreground">
            {t('tourStylesDesc')}
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tourTypes.slice(0, 3).map((tourType) => (
              <Card key={tourType.id} className="flex h-full flex-col border-border/60 bg-background/80 shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg">
                      {tourType.icon ?? '✨'}
                    </Badge>
                    <CardTitle className="font-headline text-xl">{tourType.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{tourType.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" className="px-0">
                    <Link href={`/tours?style=${tourType.id}`} className="flex items-center gap-2">
                      {t('viewTours')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {tourTypes.length > 3 && (
            <div className="mt-8 text-center">
              <Button asChild variant="outline">
                <Link href="/tour-types" className="flex items-center gap-2">
                  {tCommon('viewAll')} {tourTypes.length} {t('tourStylesTitle').toLowerCase()}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section id="tours" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center">{t('latestDiaries')}</h2>
          <p className="mt-4 text-center max-w-2xl mx-auto text-muted-foreground">
            {t('latestDiariesDesc')}
          </p>
          {recentDiaries.length > 0 ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentDiaries.map((tour) => (
                <TourCard key={tour.id} tour={tour} ratingSummary={getTourRatingSummary(tour.id) ?? undefined} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-muted-foreground">
              {t('noDiaries')}
            </p>
          )}
          {recentDiaries.length > 0 && (
            <div className="mt-12 text-center">
              <Button asChild variant="outline">
                <Link href="/tours">
                  {t('viewAllDiaries')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {recentStories.length > 0 && (
        <section id="stories" className="py-16 md:py-24 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">{t('latestStories')}</h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                {t('latestStoriesDesc')}
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentStories.map((story) => {
                const storyDate = format(story.publishedAt, 'MMM d, yyyy');
                return (
                  <Card key={story.id} className="flex h-full flex-col overflow-hidden">
                    {story.coverImageUrl && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={story.coverImageUrl}
                          alt={story.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{storyDate}</span>
                        {typeof story.readTimeMinutes === 'number' && story.readTimeMinutes > 0 && (
                          <span>{story.readTimeMinutes} min read</span>
                        )}
                      </div>
                      <CardTitle className="mt-2 text-2xl font-headline leading-tight">{story.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground leading-relaxed">{story.excerpt}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="ghost" className="px-0 text-sm">
                        <Link href="/stories" className="flex items-center gap-2">
                          {t('readStory')}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <div className="mt-12 text-center">
              <Button asChild variant="outline">
                <Link href="/stories">
                  {t('exploreStories')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section id="blog" className="py-16 md:py-24 bg-secondary/40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">{t('latestBlog')}</h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                {t('latestBlogDesc')}
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => {
                const postDate = post.publishedAt ?? post.updatedAt ?? post.createdAt;
                const formattedDate = postDate ? format(postDate, 'MMM d, yyyy') : '';
                const imageUrl = post.featuredImage?.url;
                return (
                  <Card key={post.id} className="flex h-full flex-col overflow-hidden">
                    {imageUrl && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formattedDate}</span>
                        <span>{post.authorName ?? 'Unknown'}</span>
                      </div>
                      <CardTitle className="mt-2 text-2xl font-headline leading-tight">
                        <Link href={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {post.excerpt || post.content.slice(0, 140)}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <Button asChild variant="ghost" className="px-0 text-sm">
                        <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                          {tCommon('readMore')}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <div className="mt-12 text-center">
              <Button asChild variant="outline">
                <Link href="/blog">
                  {t('exploreBlog')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section id="reviews" className="bg-secondary/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-4">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t('guestFeedback')}
            </span>
            <h2 className="text-3xl md:text-4xl font-headline font-bold">
              {t('travellersRate', { rating: overallAverageRating.toFixed(1) })}
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              {totalReviews > 0
                ? t('basedOnReviews', { count: totalReviews })
                : t('beFirst')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-4 py-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{t('averageRating')} {overallAverageRating.toFixed(1)}</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-4 py-2">
                <MapIcon className="h-4 w-4" />
                <span>{t('toursGuided', { count: finishedTours.length })}</span>
              </span>
              <Button asChild variant="ghost" className="px-4">
                <Link href="/feedback" className="flex items-center gap-2">
                  {t('shareReview')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-12">
            <ReviewCarousel reviews={approvedReviews} />
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/reviews" className="flex items-center gap-2">
                {t('readAllReviews')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/feedback" className="flex items-center gap-2">
                {t('writeReview')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl bg-secondary/30 shadow-2xl">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={primarySlide?.title ?? siteSettings.heroTitle}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-end gap-4 p-8 text-white">
                  <span className="inline-flex w-fit items-center rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em]">
                    {t('feedbackMatters')}
                  </span>
                  <p className="text-2xl font-headline leading-snug drop-shadow">{t('feedbackQuote')}</p>
                  <span className="text-sm text-white/80">
                    {t('feedbackShare')}
                  </span>
                </div>
              </div>
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">{t('voiceGuides')}</h2>
                <p className="text-lg text-muted-foreground">
                  {t('voiceDesc')}
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-4 w-4 text-accent" />
                    {t('honestStories')}
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="mt-1 h-4 w-4 text-accent" />
                    {t('everyReview')}
                  </li>
                  <li className="flex items-start gap-3">
                    <Compass className="mt-1 h-4 w-4 text-accent" />
                    {t('privacyNote')}
                  </li>
                </ul>
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/feedback">{t('openFeedbackForm')}</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/reviews">{t('browseTravellerStories')}</Link>
                  </Button>
                </div>
              </div>
            </div>
            <HomeFeedbackForm />
          </div>
        </div>
      </section>
    </div>
  );
}

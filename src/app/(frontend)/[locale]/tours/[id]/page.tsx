import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { CalendarRange, MapPin, Users, Star, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPublicContent, getTourReviews } from '@/lib/content-service';
import { getFinishedTourComments } from '@/lib/finished-tour-comments';
import type { FinishedTourComment } from '@/lib/types';
import { FinishedTourCommentForm } from '@/components/finished-tour/comment-form';
import { MediaCarousel } from '@/components/finished-tour/media-carousel';
import { RelatedContentSection } from '@/components/related-content-section';
import { TouristTripStructuredData } from '@/components/structured-data';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { buildAlternates } from '@/lib/locale-path';

interface TourPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: TourPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations('tourDetail');
  const { tours } = await getPublicContent(locale);
  const tour = tours.find((item) => item.id === id);
  if (!tour) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tourfeedbackhub.web.app';

  return {
    title: tour.status === 'for_sale' ? `${tour.name} — ${t('tourPackage')}` : `${tour.name} — ${t('finishedTourDiary')}`,
    description: tour.summary,
    alternates: {
      languages: buildAlternates(siteUrl, `/tours/${id}`),
    },
  };
}

export default async function FinishedTourPage({ params }: TourPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('tourDetail');
  const { tours, tourTypes } = await getPublicContent(locale);
  const tour = tours.find((item) => item.id === id);

  if (!tour) {
    notFound();
  }

  const isForSale = tour.status === 'for_sale';
  const priceLabel = tour.price
    ? `${tour.currency === 'USD' ? `$${tour.price.toLocaleString('en-US')}` : `${tour.price.toLocaleString('vi-VN')}₫`} ${tour.priceUnit === 'per_group' ? '/ group' : '/ person'}`
    : t('priceOnRequest');
  const groupSizeLabel = tour.groupSizeMin || tour.groupSizeMax
    ? tour.groupSizeMin && tour.groupSizeMax
      ? `${tour.groupSizeMin}–${tour.groupSizeMax} ${t('travellers')}`
      : `${tour.groupSizeMin ?? tour.groupSizeMax} ${t('travellers')}`
    : null;

  const [comments, reviews] = await Promise.all([
    isForSale ? Promise.resolve([]) : getFinishedTourComments(tour.id, locale),
    getTourReviews(tour.id, locale),
  ]);
  const ratingAggregate = comments.reduce(
    (acc, current) => {
      return {
        count: acc.count + 1,
        total: acc.total + current.rating,
      };
    },
    { count: 0, total: 0 }
  );
  const averageRating = ratingAggregate.count > 0 ? ratingAggregate.total / ratingAggregate.count : null;
  const start = tour.startDate instanceof Date ? tour.startDate : new Date(tour.startDate);
  const end = tour.endDate instanceof Date ? tour.endDate : new Date(tour.endDate);

  const formattedDateRange = `${start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })} – ${end.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const galleryPhotos = tour.photoUrls;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <div className="pb-20 bg-gradient-to-b from-background via-background/80 to-muted/40">
      <TouristTripStructuredData
        name={tour.name}
        description={tour.summary}
        image={tour.photoUrls[0]}
        url={`${baseUrl}/tours/${tour.id}`}
        itinerary={tour.itinerary}
        provider={process.env.NEXT_PUBLIC_SITE_NAME || 'Tour Insights Hub'}
      />
      <section className="relative flex flex-col overflow-hidden bg-background md:flex-row">
        <div className="relative h-[22rem] w-full overflow-hidden md:h-[26rem] md:flex-1">
          {tour.photoUrls[0] && (
            <Image
              src={tour.photoUrls[0]}
              alt={tour.name}
              fill
              priority
              className="object-cover"
              sizes="60vw"
            />
          )}
        </div>
        <div className="relative flex min-h-[22rem] w-full flex-1 items-center justify-center overflow-hidden bg-gradient-to-r from-black/85 via-black/70 to-black/60 px-4 py-16 text-center text-white">
          <div className="absolute inset-0 opacity-20">
            {tour.photoUrls[0] && (
              <Image
                src={tour.photoUrls[0]}
                alt=""
                fill
                priority
                className="object-cover blur-sm"
                sizes="100vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/60 to-black/40" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-white/70">
              {isForSale ? t('tourPackage') : t('finishedTourDiary')}
            </p>
            <h1 className="text-3xl md:text-5xl font-headline font-bold">{tour.name}</h1>
            <p className="text-sm md:text-lg text-white/80">{tour.summary}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mt-12 grid gap-10 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-headline">{t('highlights')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 text-sm text-muted-foreground lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-foreground/80 text-sm">
                    <span className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-accent" />
                      {isForSale ? (tour.departureSchedule || formattedDateRange) : formattedDateRange}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      {tour.clientCity}, {tour.clientCountry}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      {isForSale ? (groupSizeLabel ?? t('groupSizeFlexible')) : `${tour.clientCount} ${t('travellers')}`}
                    </span>
                  </div>
                  {isForSale ? (
                    tour.highlights && tour.highlights.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground/80 text-sm">{t('highlights')}</h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {tour.highlights.map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  ) : (
                    <div>
                      <h3 className="font-semibold text-foreground/80 text-sm">{t('nationalitiesRepresented')}</h3>
                      <p>{tour.clientNationalities.join(', ') || t('notRecorded')}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground/80 text-sm">{t('tourStyles')}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tour.tourTypeIds?.length ? (
                        tour.tourTypeIds.map((typeId) => {
                          const type = tourTypes.find((t) => t.id === typeId);
                          return (
                            <Link key={typeId} href={`/tour-types/${type?.slug ?? typeId}`}>
                              <Badge variant="secondary" className="hover:bg-secondary/80">
                                {type?.title ?? t('experience')}
                              </Badge>
                            </Link>
                          );
                        })
                      ) : (
                        <span className="text-muted-foreground">{t('curatedPrivateJourney')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground/80 text-sm">
                      {tour.guides && tour.guides.length > 1 ? t('ledBy') : t('leadGuide')}
                    </h3>
                    {tour.guides?.length ? (
                      <div className="flex flex-col gap-1">
                        {tour.guides.map((guide) => (
                          <Link key={guide.id} href={guide.href} className="text-foreground hover:text-primary hover:underline">
                            {guide.title}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">{t('notAssigned')}</p>
                    )}
                    {tour.guideLanguages?.length ? (
                      <p className="text-sm text-muted-foreground">
                        {t('languages')} {tour.guideLanguages.join(', ')}
                      </p>
                    ) : null}
                    {averageRating !== null && (
                      <p className="mt-2 flex flex-wrap gap-4 text-xs uppercase tracking-wide text-muted-foreground">
                        <span>{t('averageRating')} {averageRating.toFixed(1)} / 5</span>
                        <span>{ratingAggregate.count} {ratingAggregate.count === 1 ? t('review') : t('reviewsPlural')}</span>
                      </p>
                    )}
                  </div>
                  {tour.provinces?.length ? (
                    <div>
                      <h3 className="font-semibold text-foreground/80 text-sm">{t('provincesVisited')}</h3>
                      <p>{tour.provinces.join(', ')}</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-headline">{t('itineraryNotes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {tour.itinerary}
                </div>
              </CardContent>
            </Card>

            {(galleryPhotos.length > 0 || tour.videoUrls.length > 0) && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">{t('mediaKeepsakes')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MediaCarousel photos={galleryPhotos} videos={tour.videoUrls} />
                </CardContent>
              </Card>
            )}

            {isForSale && ((tour.included && tour.included.length > 0) || (tour.excluded && tour.excluded.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-headline">{t('whatsIncluded')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 text-sm text-muted-foreground sm:grid-cols-2">
                  {tour.included && tour.included.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground/80 text-sm">{t('included')}</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {tour.included.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tour.excluded && tour.excluded.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground/80 text-sm">{t('notIncluded')}</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {tour.excluded.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!isForSale && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-headline">{t('guideFeedback')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FinishedTourCommentForm tourId={tour.id} />
                  <div className="space-y-4">
                    {comments.length === 0 && (
                      <p className="text-sm text-muted-foreground">{t('noGuideFeedback')}</p>
                    )}
                    {comments.map((comment) => (
                      <CommentCard key={comment.id} comment={comment} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-headline">{t('travellerReviews')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border bg-card/50 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground">{review.authorDisplay}</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <RelatedContentSection title={t('relatedStories')} items={tour.relatedStories} />
            <RelatedContentSection title={t('relatedPosts')} items={tour.relatedPosts} />
          </div>

          <aside className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-headline">{t('atAGlance')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {isForSale && (
                  <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Tag className="h-4 w-4 text-accent" />
                    <span>{priceLabel}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-accent" />
                  <span>{isForSale ? (tour.departureSchedule || formattedDateRange) : formattedDateRange}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span>{tour.clientCity}, {tour.clientCountry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span>{isForSale ? (groupSizeLabel ?? t('groupSizeFlexible')) : `${tour.clientCount} ${t('guests')}`}</span>
                </div>
            {averageRating !== null && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                <span>{t('avgGuideRating')} {averageRating.toFixed(1)} ({ratingAggregate.count})</span>
              </div>
            )}
              </CardContent>
            </Card>

            {tour.photoUrls[0] && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">{t('coverMoment')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                    <Image src={tour.photoUrls[0]} alt={t('cover')} fill className="object-cover" sizes="100vw" />
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

interface CommentCardProps {
  comment: FinishedTourComment;
}

function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="rounded-lg border bg-card/50 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">{comment.authorName}</span>
        <span className="text-muted-foreground">{comment.createdAt.toLocaleDateString()}</span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-foreground/80">
        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        <span>{comment.rating.toFixed(1)} / 5</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{comment.message}</p>
    </div>
  );
}
